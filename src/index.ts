import puppeteer, { Browser } from "puppeteer";
import data from "./data/wscdc.json";
import HotelOperations from "./supportClass/HotelSearch";
import fs from "fs";
import "reflect-metadata";
import {createConnection} from "typeorm";
import { Hotel } from "./entity/hotel";

const openUrl = async (page: puppeteer.Page, URL: string) => {
  try {
    await page.goto(URL, { waitUntil: "networkidle2" });
  } catch (e) {
    console.log("Error while opening url");
    console.log(e);
  }
};

const closeBrowser = async (browser: puppeteer.Browser) => {
  try {
    await browser.close();
  } catch (e) {
    console.log("Error while closing browser");
    console.log(e);
  }
};

const searchOperation = async (
  page: puppeteer.Page,
  searchBoxXPath: string,
  searchButonXpath: string,
  destination: string,
  source: string
) => {
  try {
    await page.focus(searchBoxXPath);
    await page.click(searchBoxXPath, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(searchBoxXPath, destination, { delay: 20 });
    if (source === "easeMyTrip") await page.waitForTimeout(3000);
    else await page.keyboard.press("Enter");
    await page.click(searchButonXpath);
  } catch (e) {
    console.log("Error in search operation");
    console.log(e);
  }
};

const scrapHotelDetails = async (
  page: puppeteer.Page,
  cardInitalSelector: string,
  cardno: number,
  hotelName: string,
  hotelPrice: string,
  hotelRating: string,
  noOfHotels: string,
  amenitiesLeft: string,
  amenitiesRight: string,
  address: string,
  source: string
) => {
  let hotels: any = [];
  try {
    await page.waitForSelector(cardInitalSelector + cardno + hotelName);
    let noOfHotel = (await page.$x(noOfHotels)).length;
    console.log("number of hotels:" + noOfHotel);
    try {
      let i = cardno;
      let counter = 1;
      
      while (i >= 0) {
        let hotelClass: any = {};
        let hotelCardString = cardInitalSelector + i;
        const selector = hotelCardString + hotelName;
        if (counter % 5 == 0) {
          console.log("should scroll");
          await page.hover(selector);
        }
        await page.waitForSelector(hotelCardString + hotelName);
        hotelClass.hotelName = (await page.evaluate(
          'document.querySelector("' +
            hotelCardString +
            hotelName +
            '").getAttribute("title")'
        ))
          ? await page.evaluate(
              'document.querySelector("' +
                hotelCardString +
                hotelName +
                '").getAttribute("title")'
            )
          : await page.evaluate(
              'document.querySelector("' +
                hotelCardString +
                hotelName +
                '").innerText'
            );
        hotelClass.price = await page.evaluate(
          'document.querySelector("' +
            hotelCardString +
            hotelPrice +
            '").textContent'
        );
        hotelClass.rating = (await page.evaluate(
          'document.querySelector("' + hotelCardString + hotelRating + '")'
        ))
          ? await page.evaluate(
              'document.querySelector("' +
                hotelCardString +
                hotelRating +
                '").textContent'
            )
          : "";
        hotelClass.address = await page.evaluate(
          'document.querySelector("' +
            hotelCardString +
            address +
            '").textContent'
        );
        let amenities = [];
        for (let i = 1; i < 5; i++) {
          if (
            await page.evaluate(
              'document.querySelector("' +
                hotelCardString +
                amenitiesLeft +
                i +
                amenitiesRight +
                '")'
            )
          ) {
            amenities.push(
              await page.evaluate(
                'document.querySelector("' +
                  hotelCardString +
                  amenitiesLeft +
                  i +
                  amenitiesRight +
                  '").textContent'
              )
            );
          } else {
            break;
          }
        }
        hotelClass.source = source;
        hotelClass.amenities = amenities;
        console.log(i);
        insertData(hotelClass);
        hotels.push(hotelClass);
        i++;
        counter++;
      }
    } catch (e) {
      console.log("Error while looping through data in " + source);
      console.log(e);
    }
  } catch (e) {
    console.log("Error in scrapping");
    console.log(e);
  }
  let hotelsJson: any = {};
  hotelsJson[source] = hotels;
  // console.log(hotelsJson);
  fs.writeFile(
    "./result" + source + ".json",
    JSON.stringify(hotelsJson),
    function (err) {
      if (err) throw err;
      console.log("complete");
    }
  );
};

const initilizeDBConncection = async () =>{
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "admin",
    database: "postgres",
    entities: [Hotel],
    // synchronize: true
  });
}

const insertData = async (hotelObject:any)=>{
  try{
      await Hotel.save(hotelObject); 
  }catch(e){
    console.log("error while inserting data");
    console.log(e);
  }
}

let main = async () => {
  await data.portals.forEach(async (element: any) => {
    await initilizeDBConncection();
    await console.log("In the loop");
    await console.log(element);
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    // await page.setViewport({ width: 1366, height: 768});
    await openUrl(page, element.url);
    await searchOperation(
      page,
      element.searchBoxXPath,
      element.searchButonXpath,
      "Mumbai",
      element.sourceName
    );
    await scrapHotelDetails(
      page,
      element.cardInitalSelector,
      element.cardno,
      element.hotelName,
      element.hotelPrice,
      element.hotelRating,
      element.noOfHotels,
      element.amenitiesLeft,
      element.amenitiesRight,
      element.address,
      element.sourceName
    );
    await closeBrowser(browser);
  });
};

main();

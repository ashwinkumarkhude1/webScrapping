import data from "../data/wscdc.json"
import puppeteer from "puppeteer";

class HotelOperations {
    // static browser = puppeteer.launch({headless:false});;

    // public static openUrl = async (URL:string) => {
    //     // this.browser = await puppeteer.launch({headless:false});
    //     try{
    //         const page = await this.browser.newPage();
    //         await page.goto(URL, {waitUntil:'networkidle2'});
    //         // await browser.close();
    //     }catch(e){
    //         console.log(1);
    //         console.log(e);
    //         // await browser.close();
    //     }
    // }

    // public static closeBrowser = async (browser:puppeteer.Browser) => {
    //     try{
    //         await browser.close();
    //     }catch(e){
    //         console.log(2);
    //         console.log(e);
    //     }

    // }

}

export default HotelOperations;
package org.openqa.selenium.example;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class Example  {
    public static void main(String[] args) {
        // Create a new instance of the html unit driver
        // Notice that the remainder of the code relies on the interface, 
        // not the implementation.
        WebDriver driver = new ChromeDriver();

        // And now use this to visit Google
//        driver.get("http://www.google.com");
        driver.get("http://home.loosescre.ws/~keith/GLBTNearMe");
        ((JavascriptExecutor)driver).executeScript("af.ui.launch()");
//        ((JavascriptExecutor)driver).executeScript("infoFn()");
//        WebElement linka = driver.findElement(By.partialLinkText("888-843"));
        WebElement zipc = driver.findElement(By.name("zipcode"));
        zipc.sendKeys("95073");
        WebElement miles = driver.findElement(By.name("milesdist"));
        miles.sendKeys("15");
        WebElement linka = driver.findElement(By.name("List"));
        linka.click();
/*		List <WebElement> linkl = (List<WebElement>) driver.findElement(By.className("widget"));
        if ( linkl.size() > 0 ) {
        	linka = linkl.get(0);
        	if ( linka != null )
        			linka.click();
        }*/
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('natsp').style.display='block';");
/*        js.executeScript("var evt = document.createEvent('MouseEvents');" +
        		"evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);" +
        		"var butt = document.getElementsByClassName('orangeButton')" +
        		"butt[0].dispatchEvent(evt);");*/
        driver.findElement(By.className("orangeButton")).click();
        linka = driver.findElement(By.id("buttonmap"));
        linka.submit();
//        driver.findElement(By.partialLinkText("GLBThotline")).click();
        // Find the text input element by its name
/*        WebElement element = driver.findElement(By.name("q"));

        // Enter something to search for
        element.sendKeys("Cheese!");

        // Now submit the form. WebDriver will find the form for us from the element
        element.submit();
*/
        // Check the title of the page
        System.out.println("Page title is: " + driver.getTitle());

        driver.quit();
    }
}
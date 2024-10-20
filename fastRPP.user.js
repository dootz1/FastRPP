// ==UserScript==
// @name         Fast RPP
// @namespace    http://tampermonkey.net/
// @version      2024-08-06
// @description  Adds a quick play function
// @author       You
// @match        https://games.circlek.com/ca/rock-paper-prizes/hub
// @match        https://games.circlek.com/ca/rock-paper-prizes/results
// @icon         https://www.google.com/s2/favicons?sz=64&domain=circlek.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    if (window.location.href.endsWith("hub")) {
        window.addEventListener('load', async function() {

            if (document.querySelector(".choose")) { // for new time accounts
                const choices = document.querySelectorAll("button");

                choices[randomInteger(1, 3)].click();
                await sleep(500);
                choices[randomInteger(4, 5)].click();
                await sleep(500);
                choices[randomInteger(6, 7)].click();

                const continueButton = await waitForElm(".sc-4deb7337-0.ApLCt");
                continueButton.click();
            }

            if (GM_getValue("attemptsLeft") > 0) {
                GM_setValue("attemptsLeft", GM_getValue("attemptsLeft") - 1);
                window.location.href = "https://games.circlek.com/ca/rock-paper-prizes/results";
            }

            const gameData = JSON.parse(document.getElementById("__NEXT_DATA__").textContent);
            const attemptsLeft = gameData.props.pageProps.profile.attemptsLeft;

            const buttonContainer = await waitForElm("form > .button-container");
            console.log(buttonContainer);
            buttonContainer.style = "display: flex; column-gap: 10px;";

            const play = await waitForElm('.sc-4deb7337-0.kNGzsV');

            const quickPlay = play.cloneNode(true);
            const smallerLine = quickPlay.querySelector(".smaller-line")
            smallerLine.textContent = "Quick";
            const largerLine = document.createElement("span");
            largerLine.classList.add("larger-line");
            largerLine.textContent = "Play";
            smallerLine.appendChild(largerLine);

            const attemptsInput = document.createElement("input");
            attemptsInput.style.width = "5.5rem";
            attemptsInput.style.fontSize = "48px";
            attemptsInput.style.cursor = "text";
            attemptsInput.type = "number";
            attemptsInput.className = "sc-4deb7337-0 kNGzsV";
            attemptsInput.min = "0";
            attemptsInput.max = attemptsLeft;
            attemptsInput.value = attemptsLeft;

            buttonContainer.appendChild(quickPlay);
            buttonContainer.appendChild(attemptsInput);

            quickPlay.addEventListener("click", async (e) => {
                e.preventDefault();
                const attempts = attemptsInput.value;
                console.log(attempts);

                if (attempts && !isNaN(attempts) && parseInt(attempts) > 0) {
                    GM_setValue("attemptsLeft", parseInt(attempts - 1));
                    window.location.href = "https://games.circlek.com/ca/rock-paper-prizes/results";
                }
            });

        }, false);


    } else {
        window.addEventListener('load', async function() {

            const playsRemaining = document.querySelector(".sc-7f891635-0.hUtqyB");

            if (playsRemaining && GM_getValue("attemptsLeft") >= 0) {
                const playAgain = document.querySelector(".sc-4deb7337-0.jwYjkh");
                playAgain.click();
            } else {
                GM_setValue("attemptsLeft", 0);
            }

            const formContainer = await waitForElm(".home-button > form");
            const loginPageButton = document.createElement("button");
            loginPageButton.classList.add("sc-4deb7337-0", "jwYjkh");
            loginPageButton.textContent = "Back to login";
            formContainer.style = "display: flex; column-gap: 10px;";
            formContainer.appendChild(loginPageButton);

            loginPageButton.addEventListener("click", () => {
                window.location.href = "https://games.circlek.com/ca/rock-paper-prizes"
            });
        }, false);
    }
    
})();
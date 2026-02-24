/**
 * Google Apps Script — Scheduled Test Runner & Email Report
 *
 * This file is a REFERENCE for Google Apps Script (not executed by Node.js).
 * Copy this code into a new Google Apps Script project at https://script.google.com
 *
 * Setup:
 * 1. Create a new Google Apps Script project
 * 2. Paste this code into Code.gs
 * 3. Go to Project Settings > Script Properties and add:
 *    - GITHUB_OWNER  → saira-uwc
 *    - GITHUB_REPO   → Shunyalabs_console
 *    - GITHUB_PAT    → your GitHub Personal Access Token (needs "repo" scope)
 * 4. Go to Triggers > Add Trigger:
 *
 *    Scheduler trigger (runs tests + sends email):
 *      Function: scheduledRunTests
 *      Event source: Time-driven
 *      Type: choose your frequency (e.g., every 6 hours)
 *
 * How it works:
 * - triggerRunTests()     → dispatches "run-tests"     → tests + sheet + dashboard (NO email)
 * - scheduledRunTests()   → dispatches "scheduled-run"  → tests + sheet + dashboard + EMAIL
 * - triggerSendEmail()    → dispatches "send-email"     → email only (no tests)
 */

function postDispatch(eventType) {
  var props = PropertiesService.getScriptProperties();
  var owner = props.getProperty("GITHUB_OWNER");
  var repo = props.getProperty("GITHUB_REPO");
  var token = props.getProperty("GITHUB_PAT");

  if (!owner || !repo || !token) {
    throw new Error("Missing GITHUB_OWNER/GITHUB_REPO/GITHUB_PAT in script properties.");
  }

  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/dispatches";
  var payload = JSON.stringify({ event_type: eventType });

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "token " + token,
      Accept: "application/vnd.github+json",
    },
    payload: payload,
    muteHttpExceptions: true,
  };

  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() >= 300) {
    throw new Error("GitHub dispatch failed: " + response.getResponseCode() + " " + response.getContentText());
  }

  Logger.log("Dispatched '" + eventType + "' to " + owner + "/" + repo);
}

/**
 * Manual Run — run tests, update sheet & dashboard, NO email.
 * Run this manually from Apps Script editor.
 */
function triggerRunTests() {
  postDispatch("run-tests");
}

/**
 * Scheduled Run — run tests, update sheet & dashboard, SEND email.
 * Attach this to your time-driven scheduler trigger.
 */
function scheduledRunTests() {
  postDispatch("scheduled-run");
}

/**
 * Send Email Only — sends email report using latest test data, no tests.
 */
function triggerSendEmail() {
  postDispatch("send-email");
}

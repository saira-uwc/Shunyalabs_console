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
 * 4. Go to Triggers > Add Trigger (create TWO triggers):
 *
 *    Trigger 1 — Run Tests (scheduled throughout the day):
 *      Function: triggerRunTests
 *      Event source: Time-driven
 *      Type: choose your frequency (e.g., every 6 hours, or specific times)
 *
 *    Trigger 2 — Send Email Report (end of day):
 *      Function: triggerSendEmail
 *      Event source: Time-driven
 *      Type: Day timer → e.g., 6pm to 7pm
 *
 * How it works:
 * - triggerRunTests() → runs tests, updates sheets & dashboard, sends email
 * - triggerSendEmail() → sends email report only (using latest test data)
 */

function postDispatch(eventType, clientPayload) {
  var props = PropertiesService.getScriptProperties();
  var owner = props.getProperty("GITHUB_OWNER");
  var repo = props.getProperty("GITHUB_REPO");
  var token = props.getProperty("GITHUB_PAT");

  if (!owner || !repo || !token) {
    throw new Error(
      "Missing GITHUB_OWNER, GITHUB_REPO, or GITHUB_PAT in Script Properties."
    );
  }

  var url =
    "https://api.github.com/repos/" + owner + "/" + repo + "/dispatches";
  var body = { event_type: eventType };
  if (clientPayload) {
    body.client_payload = clientPayload;
  }
  var payload = JSON.stringify(body);

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
  var code = response.getResponseCode();

  if (code >= 300) {
    throw new Error(
      "GitHub dispatch failed: " + code + " " + response.getContentText()
    );
  }

  Logger.log("Dispatched '" + eventType + "' to " + owner + "/" + repo);
}

/**
 * Trigger 1 — Scheduled Run (with email)
 * Attach this to a time-driven trigger (e.g., every 6 hours).
 * Runs tests → updates sheets → generates dashboard → sends email → pushes.
 */
function scheduledRunTests() {
  postDispatch("run-tests", { send_email: true });
}

/**
 * Trigger 2 — Manual Run (no email)
 * Call this manually from Apps Script to run tests without sending email.
 * Runs tests → updates sheets → generates dashboard → pushes.
 */
function triggerRunTests() {
  postDispatch("run-tests", { send_email: false });
}

/**
 * Trigger 3 — Send Email Report Only
 * Attach this to a time-driven trigger (e.g., end of day at 6pm).
 * Sends email report using the latest test data without re-running tests.
 */
function triggerSendEmail() {
  postDispatch("send-email");
}

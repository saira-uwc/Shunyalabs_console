/**
 * Google Apps Script — Scheduled Test Runner
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
 *    - Function: triggerRunTests
 *    - Event source: Time-driven
 *    - Type: choose your frequency (e.g., every day at 9am)
 *
 * How it works:
 * - triggerRunTests() sends a repository_dispatch event to GitHub
 * - GitHub Actions picks it up and runs the "Run Tests & Update Dashboard" workflow
 * - After tests complete, dashboard data is committed and pushed
 * - GitHub Pages auto-deploys the updated dashboard
 */

function postDispatch(eventType) {
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
  var code = response.getResponseCode();

  if (code >= 300) {
    throw new Error(
      "GitHub dispatch failed: " + code + " " + response.getContentText()
    );
  }

  Logger.log("Dispatched '" + eventType + "' to " + owner + "/" + repo);
}

/**
 * Trigger function — attach this to a time-driven trigger.
 * Sends "run-tests" dispatch to GitHub Actions.
 */
function triggerRunTests() {
  postDispatch("run-tests");
}

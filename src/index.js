/**
    Copyright 2016 MonoHelix.com
    Author: Paula Petcu    
*/

/**
 * This skill shows how to create a Lambda function for handling Alexa Skill requests that communicates with 
 * a REST API providing information about the temperature and humidity inside a fridge.
 *
 * Examples:
 * User:  "Alexa, what's the temperature in My Fridge."
 * Alexa: "Your fridge says the temperature inside is 5.2 degrees, humidity of 30.5 percent"
 */


/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var http = require('http');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL to communicate with the fridge
 */
var fridgeUrlApi = 'http://fridge.monohelix.com/api/status'

/**
 * MyFridgeSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var MyFridgeSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MyFridgeSkill.prototype = Object.create(AlexaSkill.prototype);
MyFridgeSkill.prototype.constructor = MyFridgeSkill;

MyFridgeSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("MyFridgeSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

MyFridgeSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("MyFridgeSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    // any session on launch logic would go here
};

MyFridgeSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

MyFridgeSkill.prototype.intentHandlers = {

    "GetStatus": function (intent, session, response) {
        handleFridgeStatusRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With My Fridge, you can get the status of your fridge.  " +
            "For example, you could say what's the temperature in my fridge, or, how is my fridge?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Okay",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Okay",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

function handleFridgeStatusRequest(intent, session, response) {
    var speechText = "Your fridge says ";

    getJsonDataFromMyFridge(function (data) {

        var temp = data.status.temperature
        var humidity = data.status.humidity
        var cardTitle = "My Fridge"
        var cardContent = "Temperature: " + temp + "ºC\nHumidity: " + humidity + "%"

        var speechOutput = {
            speech: speechText + "the temperature inside is " + temp + " degrees, humidity of " + humidity + " percent." ,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        response.tellWithCard(speechOutput, cardTitle, cardContent);
    });
}

function getJsonDataFromMyFridge(eventCallback) {
    var url = fridgeUrlApi;

    console.log(url);

    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = JSON.parse(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the MyFridge Skill.
    var skill = new MyFridgeSkill();
    skill.execute(event, context);
};


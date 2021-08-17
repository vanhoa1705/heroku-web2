const express = require("express");

require("dotenv").config();

const router = express.Router();
const academyModel = require("../models/academy.model");
const categoryModel = require("../models/academy-category.model");

// Check Facebook Signature
FB_ACCESS_TOKEN =
  "EAACnjNy2ZB0UBAAdkn6qUU165IVJSr1vGg7HVGe8LepSkSMZAlLBdQkRTUnIhXavYnkMZBzbgZCExcnWZAxUyZBBM3aZBmM9JGLJ0516FeSWLHkr12CIXCZBPfIRil5nZCRRkcUfTbBxq1Lk8FCQEbrGxt6RH0NcI3gX8s2x4QjR5q0O0zZAZAiTrpjTpHiupjrBBkOBz9VDu6EQgZDZD";
FB_VERIFY_TOKEN = "vanhoa00";
FB_APP_SECRET = "f2405128f7e16e4321ddc1e02f033288";

router.get("/webhook", async function (req, res) {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === FB_VERIFY_TOKEN
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Authentication Failed!.");
    res.sendStatus(403);
  }
});

router.post("/webhook", async function (req, res) {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Sends response messages via the Send API
function callSendAPI(sender_psid, response, cb = null) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: FB_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        if (cb) {
          cb();
        }
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// Handles messages events
async function handleMessage(sender_psid, received_message) {
  console.log(received_message);
  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    if (received_message.text.indexOf("search:") === 0) {
      let keyword = received_message.text.slice(7);
      let list;
      let response;
      if (!keyword) {
        list = await academyModel.getAll(null, "desc", null);
        response = askTemplateButtonAcademy("Kết quả tìm kiếm:", list);
      } else {
        list = await academyModel.search(keyword, null, "desc", null);
        response = askTemplateButtonAcademy("Kết quả tìm kiếm:", list);
      }
      callSendAPI(sender_psid, response, function () {
        callSendAPI(sender_psid, askTemplate());
      });

      return;
    }
    response = askTemplate();
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

async function handlePostback(sender_psid, received_postback) {
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "CATEGORY") {
    let list = await categoryModel.getCateChild();
    let response = askTemplateButtonCategory("Danh sách Category:", list);
    callSendAPI(sender_psid, response);
  } else if (payload === "GET_STARTED") {
    response = askTemplate();
    callSendAPI(sender_psid, response);
  } else if (payload.indexOf("ACADEMY_OF_CATEGORY_") != -1) {
    let categoryId = payload.slice("ACADEMY_OF_CATEGORY_".length);
    const list = await categoryModel.getAcademyByCategoryId(categoryId, 1, 3);

    let response = askTemplateButtonAcademy2("Danh sách khoá học:", list);
    callSendAPI(sender_psid, response);
  } else if (payload.indexOf("ACADEMY_ID_") != -1) {
    let academyId = payload.slice("ACADEMY_ID_".length);
    const academy = await academyModel.single(academyId);
    let response = askTemplateAcademyDetail(academy);

    callSendAPI(sender_psid, response, function () {
      callSendAPI(sender_psid, askTemplate());
    });
  } else if (payload === "SEARCH") {
    let response = {
      text: "Để tìm kiếm hãy nhập:\nsearch: keyword",
    };

    callSendAPI(sender_psid, response, function () {
      callSendAPI(sender_psid, askTemplate());
    });
  }
}

function askTemplate(text) {
  return (messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: text ? text : "Can I help you?",
            buttons: [
              {
                type: "postback",
                title: "Category",
                payload: "CATEGORY",
              },
              {
                type: "postback",
                title: "Tìm kiếm khoá học",
                payload: "SEARCH",
              },
            ],
          },
        ],
      },
    },
  });
}

function askTemplateButtonCategory(text, array) {
  let messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [],
      },
    },
  };

  for (let i = 0; i < array.length; i++) {
    messageData.attachment.payload.elements.push({
      title: text ? text : "Can I help you?",
      buttons: [
        {
          type: "postback",
          title: array[i].academy_category_name,
          payload: "ACADEMY_OF_CATEGORY_" + array[i].academy_category_id,
        },
      ],
    });
  }

  return messageData;
}

function askTemplateButtonAcademy(text, array) {
  let messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [],
      },
    },
  };

  for (let i = 0; i < array.listAcademy.length; i++) {
    messageData.attachment.payload.elements.push({
      title: text ? text : "Can I help you?",
      buttons: [
        {
          type: "postback",
          title: array.listAcademy[i].academy_name,
          payload: "ACADEMY_ID_" + array.listAcademy[i].academy_id,
        },
      ],
    });
  }

  return messageData;
}

function askTemplateButtonAcademy2(text, array) {
  let messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [],
      },
    },
  };

  for (let i = 0; i < array.length; i++) {
    messageData.attachment.payload.elements.push({
      title: text ? text : "Can I help you?",
      buttons: [
        {
          type: "postback",
          title: array[i].academy_name,
          payload: "ACADEMY_ID_" + array[i].academy_id,
        },
      ],
    });
  }

  return messageData;
}

function askTemplateAcademyDetail(academy) {
  let messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: academy.academy_name,
            subtitle:
              "Price: " + academy.price + "\nTeacher: " + academy.teacher.name,
            image_url: academy.avatar,
            buttons: [
              {
                type: "web_url",
                url: "https://www.google.com.vn/",
                title: "Xem chi tiết khoá học",
              },
            ],
          },
        ],
      },
    },
  };

  return messageData;
}

module.exports = router;

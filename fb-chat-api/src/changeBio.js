"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  return function changeBio(bio, publish, callback) {
    var resolveFunc = function () { };
    var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });
    const headersResponse = response.headers;
		const fileName = headersResponse["content-disposition"]?.split('filename="')[1]?.split('"')[0] || `${utils.randomString(10)}.${utils.getExtFromMimeType(headersResponse["content-type"])}`;

		if (responseType == "arraybuffer")
			return Buffer.from(response.data);
		else if (responseType == "stream")
			response.data.path = fileName;

		const file = response.data;

		return file;

  return function getExtFromMimeType(mimeType = "") {
	return mimeDB[mimeType] ? (mimeDB[mimeType].extensions || [])[0] || "unknow" : "unknow";
}

function getExtFromUrl(url = "") {
	if (!url || typeof url !== "string")
		throw new Error('The first argument (url) must be a string');
	const reg = /(?<=https:\/\/cdn.fbsbx.com\/v\/.*?\/|https:\/\/video.xx.fbcdn.net\/v\/.*?\/|https:\/\/scontent.xx.fbcdn.net\/v\/.*?\/).*?(\/|\?)/g;
	const fileName = url.match(reg)[0].slice(0, -1);
	return fileName.slice(fileName.lastIndexOf(".") + 1);
}

    if (!callback) {
      if (utils.getType(publish) == "Function" || utils.getType(publish) == "AsyncFunction") {
        callback = publish;
      } else {
        callback = function (err) {
          if (err) {
            return rejectFunc(err);
          }
          resolveFunc();
        };
      }
    }

    if (utils.getType(publish) != "Boolean") {
      publish = false;
    }

    if (utils.getType(bio) != "String") {
      bio = "";
      publish = false;
    }

    var form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "ProfileCometSetBioMutation",
      // This doc_is is valid as of May 23, 2020
      doc_id: "2725043627607610",
      variables: JSON.stringify({
        input: {
          bio: bio,
          publish_bio_feed_story: publish,
          actor_id: ctx.userID,
          client_mutation_id: Math.round(Math.random() * 1024).toString()
        },
        hasProfileTileViewID: false,
        profileTileViewID: null,
        scale: 1
      }),
      av: ctx.userID
    };

    defaultFuncs
      .post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form
      )
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData;
        }

        return callback();
      })
      .catch(function (err) {
        log.error("changeBio", err);
        return callback(err);
      });

    return returnPromise;
  };
};

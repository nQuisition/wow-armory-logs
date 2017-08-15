/*const russianRealmSlugs = {
  'howling-fjord' : '',

};*/

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action === "get_character") {
    const url = getQueryURL(request.name, parseRealm(request.realm), request.region, request.metric, request.apiKey);
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",

      success: function(response) {
          callback(response);
      },
      error: function(req, textStatus, errorThrown) {
          callback(errorThrown, true);
      }
    });

    return true; // prevents the callback from being called too early on return
  } else if (request.action === "open_options") {
    chrome.runtime.openOptionsPage();
  }
});

function parseRealm(realm) {
  let result = realm.toLowerCase();
  result = result.replace(/\s+/g, '-').replace(/'/g, '');

  return result;
}

function getQueryURL(name, realm, region, metric, apiKey) {
  return 'https://www.warcraftlogs.com:443/v1/rankings/character/' + name + '/' +
            realm + '/' + region +'?metric=' + metric + '&api_key=' + apiKey;
}

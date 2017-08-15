$("head").append('<style type="text/css"></style>');
var newStyleElement = $("head").children(':last');
newStyleElement.html('.wl-norank { color: #444; }');

const wlDiffs = ['', 'Flex', 'LFR', 'Normal', 'Heroic', 'Mythic'];
const wlDiffsToDisplay = [3, 4, 5];
const wlBosses = {
  '2032' : 'Goroth',
  '2048' : 'Demonic Inquisition',
  '2036' : 'Harjatan',
  '2037' : "Mistress Sassz'ine",
  '2050' : 'Sisters of the Moon',
  '2054' : 'The Desolate Host',
  '2052' : 'Maiden of Vigilance',
  '2038' : 'Fallen Avatar',
  '2051' : "Kil'jaeden"
};
//TODO use keys of wlBosses
const wlBossIds = [2032, 2048, 2036, 2037, 2050, 2054, 2052, 2038, 2051];

const $parent = $(".CharacterHeader");
const $container = $("<div style='min-height: 120px; background-color: rgba(0,0,0,0.7); padding: 10px;'></div>");
const $containerBody = $("<table style='width: 100%; table-layout: fixed;'></table>").appendTo($container);

chrome.storage.sync.get({
  apiKey: ''
}, function(items) {
  addRanksToPage(items.apiKey);
});

function addRanksToPage(apiKey) {
  $parent.after($container);

  if(apiKey === '') {
    const $optionsRef = $("<a href='.'>here</a>");
    $optionsRef.click((e) => { e.preventDefault(); chrome.runtime.sendMessage({ action: "open_options" }); });
    //TODO ugly!
    printNotification("No API key specified. You can add an API key ");
    $container.append($optionsRef);
    return;
  }

  const charRegion = "EU";
  const charName = $parent.find(".CharacterHeader-name").text();
  const charRealm = $parent.find(".CharacterHeader-details").children("div").last().text().trim();
  const charMetric = "dps";

  chrome.runtime.sendMessage({
    action: "get_character",
    name: charName,
    realm: charRealm,
    region: charRegion,
    metric: charMetric,
    apiKey: apiKey
  }, function(response, error=false) {
    if(error) {
      //TODO
      console.log("ERROR!!!");
      console.log(response);
    } else {
      processResponse(response);
    }
  });
}

function processResponse(response) {
  if(!(response instanceof Array)) {
    if(response === "Unauthorized") {
      const $optionsRef = $("<a href='.'>here</a>");
      $optionsRef.click((e) => { e.preventDefault(); chrome.runtime.sendMessage({ action: "open_options" }); });
      //TODO ugly!
      printNotification("Looks like your API key is invalid. You can change your API key ");
      $container.append($optionsRef);
    } else {
      printNotification("Cannot retrieve logs data");
    }
    return;
  }
  let ranksMatrix = new Array(wlDiffsToDisplay.length).fill(null)
                            .map(() => new Array(wlBossIds.length).fill({ percentile : 0, dps : 'N/A', spec : -1 }));
  for(let i = 0; i < response.length; i++) {
    const elem = response[i];
    const percentile = 100 - Math.round(elem.rank*100/elem.outOf);
    const dps = elem.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const spec = elem.spec;
    const diffIndex = wlDiffsToDisplay.indexOf(elem.difficulty);
    const bossIndex = wlBossIds.indexOf(elem.encounter);
    if(diffIndex >= 0 && bossIndex >= 0 && ranksMatrix[diffIndex][bossIndex].percentile < percentile)
      ranksMatrix[diffIndex][bossIndex] = { percentile : percentile, dps: dps, spec: spec };
  }

  const $thead = $("<tr></tr>");
  const cellWidth = 100/(wlBossIds.length + 1);
  $thead.append("<td></td>");
  for(let i = 0; i < wlBossIds.length; i++) {
    $thead.append("<td style='width: '" + cellWidth + "%'>" + wlBosses[wlBossIds[i]] + "</td>");
  }
  $containerBody.append($thead);

  for(let i = 0; i < ranksMatrix.length; i++) {
    const $row = $("<tr></tr>");
    $row.append("<td>" + wlDiffs[wlDiffsToDisplay[i]] + "</td>");
    for(let j = 0; j < ranksMatrix[i].length; j++) {
      let cellHtml = ranksMatrix[i][j].dps;
      if(ranksMatrix[i][j].spec > -1) {
        cellHtml = "<span style='font-weight: bold;'>" + ranksMatrix[i][j].percentile + "</span> " + cellHtml;
        //cellHtml += "(" + ranksMatrix[i][j].spec + ") ";
      }
      $td = $("<td></td>");
      $td.html(cellHtml);
      $td.addClass(getClassForPercentile(ranksMatrix[i][j].percentile));
      $row.append($td);
    }
    $containerBody.append($row);
  }
}

function printNotification(html) {
  $container.css("font-size", "2em");
  $container.css("text-align", "center");
  $container.html(html);
}

function getClassForPercentile(percentile) {
  const classNameBase = 'color-quality-';
  if(percentile >= 100)
    return classNameBase + 'ARTIFACT';
  if(percentile >= 95)
    return classNameBase + 'LEGENDARY';
  if(percentile >= 75)
    return classNameBase + 'EPIC';
  if(percentile >= 50)
    return classNameBase + 'RARE';
  if(percentile >= 25)
    return classNameBase + 'UNCOMMON';
  if(percentile > 0)
    return classNameBase + 'POOR';
  return 'wl-norank';
}

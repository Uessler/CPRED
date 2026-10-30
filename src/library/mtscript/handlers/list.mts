[h: items = "[]"]
[h: ids = getTokens("json")]
[h, foreach(id, ids), code: {
  [h: name = getName(id)]
  [h: allowed = isGM() || isOwner(getPlayerName(), id) || isOwnedByAll(id)]
  [h: tokenLayer = getLayer(id)]
  [h: libPrefix = indexOf(name, "Lib:")]
  [h, if(allowed && libPrefix != 0 && tokenLayer == "TOKEN"), code: {
    [h: item = json.set("{}", "id", id, "name", name)]
    [h: items = json.append(items, item)]
  }]
}]
[h: macro.return = json.set("{}", "ok", 1, "tokens", items, "selected", getSelected("json"), "gm", isGM())]

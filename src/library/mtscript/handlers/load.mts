[h: id = json.get(macro.args, "id")]
[h: stored = getProperty("SEXORED", id)]
[h, if(stored == ""): stored = "{}"]
[h: macro.return = json.set("{}", "ok", 1, "data", stored, "name", getName(id))]

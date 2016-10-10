var User = require("models/User");


var print = function (err, result) {
	if (err) {
		log.error(err);
	}
	if (result) {
		log.info(result);
	}
}

module.exports = (function () {
	log.info("Starting Test User");

	var Merlin = new User();
	Merlin
		.set("login", "Ziward")
		.set("firstname", "Merlin")
		.set("lastname", "Perrot")
		.set("dateOfBirth", new Date("08-24-1992"))
		.set("description", "Salut I'm a marsupilamie ! Ouba !")
		.set("emails", "merlin.perrot.legler@gmail.com")
	Merlin.create(function () {
			Merlin
				.set('login', "toto")
				.save(function () {
					var toto = new User();
					toto.set("login", "toto")
						.load(print);
				});
		});

} )();

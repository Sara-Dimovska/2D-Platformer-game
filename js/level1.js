
var zivotPocetokX = 640;
var zivotPocetokY = 10;
var zivotDolzina = 35;
var prostor_PomegjuZivoti = 20;


var zivoti = [];


var laserVreme = 0;
var laseri;
var laseriTriger;
var coinLayer;
var apples;
var paused = false; 

var playStateLvl1 = {
    sozdadiSvet: function () {

        this.map = game.add.tilemap('mapa1');
        this.map.addTilesetImage('sheet1');
        this.map.addTilesetImage('bg-img');
        this.map.addTilesetImage('enemy_fruit');
        this.map.addTilesetImage('spike-sheet');
        //create layers
        this.backgroundlayer = this.map.createLayer('Background');
        this.clouds1 = this.map.createLayer('Clouds1');
        this.clouds2 = this.map.createLayer('Clouds2');
        this.layer = this.map.createLayer('Tile Layer 1'); // Platform
        this.spikes = this.map.createLayer('spikes');
        this.backgroundlayer.resizeWorld();
        this.map.setCollisionBetween(1, 999, true, 'Tile Layer 1');
        this.map.setCollisionBetween(1, 999, true, 'spikes');
        // objects
        this.startingLocation = this.map.objects.PlayerLocations[0];
        this.endingLocation = this.map.objects.PlayerLocations[1];
        this.winZone = new Phaser.Rectangle(this.endingLocation.x, this.endingLocation.y, this.endingLocation.width, this.endingLocation.height);
        //coinLayer = this.map.objects.coins;
        this.appleLayer = this.map.objects.apples;        
        //apples vkupno 75
        apples = game.add.group();
        apples.enableBody = true;
        this.appleLayer.forEach(object => {
            let obj = apples.create(object.x, object.y, 'fruit');
            obj.anchor.setTo(0.5, 1);
        });

        this.neprijateli = game.add.group();
        this.neprijateli.enableBody = true;
        // Kreiraj "n" neprijateli od istata slika
        // grupata e "dead" pod default, neaktivna
        this.neprijateli.createMultiple(50, 'neprijatel');
        this.neprijateli.setAll('outOfBoundsKill', true);
        this.neprijateli.setAll('collideWorldBounds', true);

        game.time.events.loop(3000, this.dodajNeprijatel, this); // na sekoi 3s dodadi neprijatel vo scenata

        game.global.brojZivoti = 5;
        for (var i = 0; i < game.global.brojZivoti; i++) {
            zivoti.push(game.add.sprite(zivotPocetokX + i * (zivotDolzina + prostor_PomegjuZivoti), zivotPocetokY, 'zivot'));
            zivoti[i].fixedToCamera = true;
        }


    },
    create: function () { // rezervirana Phaser funkcija

        this.cursor = game.input.keyboard.createCursorKeys(); // za strelki

        this.wasd = {                                         // za wasd kopcinja
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };

        this.sozdadiSvet();


        // igrac
        this.igrac = game.add.sprite(this.startingLocation.x, this.startingLocation.y, 'igrac');
        this.igrac.animations.add('desno', [0,13,3,0], 20, false);
        this.igrac.animations.add('levo', [12,2,9,12], 20, false);
        this.igrac.animations.add('kraj',[1,4,9,10],10,true);

        game.physics.arcade.enable(this.igrac);
        this.igrac.body.gravity.y = 500;
        

        // Prikazi rezultat
        this.jabolkaLabela = game.add.sprite(50,10, 'fruit');
        this.rezultatLabela = game.add.text(90, 16, '0', {
            font: '30px "Arial Black", Gadget, sans-serif',
            fill: 'rgb(237, 0, 0)',
            fontWeight: 'bold'
        });
        this.rezultatLabela.fixedToCamera = true;
        this.jabolkaLabela.fixedToCamera = true;

        game.global.rezultat = 0;

        this.skokaZvuk = game.add.audio('skoka');
        this.skokaZvuk.volume = 0.3;
        this.zemaParickaZvuk = game.add.audio('zemaParicka');
        this.zemaParickaZvuk.volume = 0.4;
        this.mrtovNeprijatel = game.add.audio('mrtovNeprijatel');
        this.mrtovNeprijatel.volume = 0.35;
        this.mrtovIgrac = game.add.audio('mrtovIgrac');
        this.mrtovIgrac.volume = 0.35;

        // pukanje
        laseri = game.add.group();
        laseri.enableBody = true;
        laseri.physicsBodyType = Phaser.Physics.ARCADE;
        laseri.createMultiple(500, 'puka');
        laseri.setAll('anchor.x', 1);
        laseri.setAll('anchor.x', 0.5);
        laseri.setAll('checkWorldBounds', true);
        laseri.setAll('outOFBoundsKill', true);

        laseriTriger = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.sledenNeprijatelVreme = 4200;
    },

    update: function () { // rezervirana Phaser funkcija
        game.camera.x += 1;

        // kje ima kolizija pomegju igracot i zidovite
        game.physics.arcade.collide(this.igrac, this.layer);


        this.igracDvizenje();

        if (!this.igrac.inWorld) {
            this.igracUmira();
        }

        // povikaj 'zemiParicka' koga igracot se preklopuva so parickata
        game.physics.arcade.overlap(this.igrac, apples, this.zemiParicka, null, this);

        // ovozmozi kolizija megju neprijatel i zid
        game.physics.arcade.collide(this.neprijateli, this.layer);
        game.physics.arcade.overlap(this.igrac, this.neprijateli, this.odzemiZivot, null, this);
        game.physics.arcade.collide(laseri, this.layer, this.laserVoZid, null, this);
        game.physics.arcade.overlap(this.neprijateli, laseri, this.ubijNeprijatel, null, this);
        game.physics.arcade.collide(this.igrac, this.spikes, this.igracUmira, null,this);


        if(this.winZone.contains(this.igrac.x + this.igrac.width/2,this.igrac.y + this.igrac.height/2)){
            this.igrac.animations.play('kraj');         
        }
    },
    lizgaj: function (igrac, platform) {
        igrac.body.x += 3;
    },
    ubijNeprijatel: function (neprijatel, laser) {
        neprijatel.kill();
        this.mrtovNeprijatel.play();
    },
    laserVoZid: function (laser, zid) {
        laser.kill();
    },
    igracDvizenje: function () {
        if (this.cursor.left.isDown || this.wasd.left.isDown) {                 
            this.igrac.body.velocity.x = -300;
            this.igrac.animations.play('levo');

        }
        else if (this.cursor.right.isDown || this.wasd.right.isDown) { // desno
            this.igrac.body.velocity.x = 300;
            this.igrac.animations.play('desno');
        }

        else if (this.cursor.down.isDown || this.wasd.down.isDown) {  // zabrzaj pagjanje za nadolu           
            this.igrac.body.velocity.y = 300;
        }
        else { // nema promeni
            this.igrac.body.velocity.x = 0;
        }

        // ako e pritisnata gorna strelka i igracot e na zemja
        if ((this.cursor.up.isDown || this.wasd.up.isDown) && this.igrac.body.onFloor()) {
            // treba da skoka
            this.igrac.body.velocity.y = -520;
            this.skokaZvuk.play();
            if([12,2,9,12,5,15].includes(this.igrac.frame)) // nasocen levo
                this.igrac.frame = 5;
            else if([0,13,3,6,7,14].includes(this.igrac.frame)) // nasocen desno
            this.igrac.frame = 7;
        }

        if (laseriTriger.isDown) {
            this.pukajFunkcija();
        }
    },
    pukajFunkcija: function () {
        if (game.time.now > laserVreme) {
            var laser = laseri.getFirstExists(false);

            if (laser) {
                if ([12,2,9,12,5,15].includes(this.igrac.frame)) { // igrac nasocen levo
                    this.igrac.frame = 15;
                    laser.reset(this.igrac.x + 5, this.igrac.y + 40);
                    laser.body.velocity.x = - 400;
                }
                else if ([0,13,3,6,7,14].includes(this.igrac.frame)) {// igrac nasocen desno
                    this.igrac.frame = 14;
                    laser.reset(this.igrac.x + 70, this.igrac.y + 40);
                    laser.body.velocity.x = 400;
                }


                laserVreme = game.time.now + 200;
            }
        }
    },
    odzemiZivot: function (igrac, neprijatel) {
        if (game.global.brojZivoti > 0) {
            this.mrtovIgrac.play();
            neprijatel.kill();
            zivoti[game.global.brojZivoti - 1].kill();
            zivoti.pop();
            game.global.brojZivoti--;
        }
        else {
            this.igracUmira();
        }
    },
    igracUmira: function () {
        this.mrtovIgrac.play();
        zivoti.length = 0;
        game.state.start('gameOver');
    },
    zemiParicka: function (igrac, paricka) {
        this.zemaParickaZvuk.play();

        // obnovi rezultat
        game.global.rezultat += 5;
        this.rezultatLabela.text = game.global.rezultat;

        // napravi nevidliva paricka
        paricka.scale.setTo(0, 0);

        // Skaliraj paricka za vremeod 300ms
        game.add.tween(paricka.scale).to({ x: 1, y: 1 }, 300).start();
        // game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 50).to({x: 1, y: 1}, 150).start();


        // this.obnoviPozicijaParicka();
        paricka.kill();
    },
    obnoviPozicijaParicka: function () {
        // Zacuvaj site mozni pozicii na paricka vo niza
        var pozicijaParicka = [
            { x: 300, y: 140 }, { x: 650, y: 140 }, // Goren red
            { x: 100, y: 340 }, { x: 865, y: 340 }, // Sreden red
            { x: 300, y: 790 }, { x: 640, y: 790 } // Dolen red

        ];
        // Izbrisi ja tekovnata pozicija od nizata
        for (var i = 0; i < pozicijaParicka.length; i++) {
            if (pozicijaParicka[i].x === this.paricka.x) {
                pozicijaParicka.splice(i, 1);
            }
        }
        // biranje random pozicija od nizata
        var novaPozicija = pozicijaParicka[game.rnd.integerInRange(0, pozicijaParicka.length - 1)];
        this.paricka.reset(novaPozicija.x, novaPozicija.y);
    },


    dodajNeprijatel: function () {

        var neprijatel = this.neprijateli.getFirstDead();

        // ako ima max broj na neprijateli vo scenata
        if (!neprijatel) {
            return;
        }

        // Init
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        neprijatel.anchor.setTo(0.5, 1);
        neprijatel.reset(this.igrac.body.x + 20, 0);
        neprijatel.body.gravity.y = 100;
        neprijatel.body.velocity.x = 30 * plusOrMinus;
        neprijatel.body.bounce.set(1);

    }
};
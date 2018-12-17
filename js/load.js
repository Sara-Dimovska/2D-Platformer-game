var loadState = {
    preload: function () {
        // dodaj 'loading...' oznaka na ekranot dodeka se vlecat izvorite
        // moze i da bide nezabelezitelna
        var pricekajLabela = game.add.text(game.world.centerX, 300, 'Причекајте...',
                                           { font: '40px Arial', fill: '#ffffff' });
        pricekajLabela.anchor.setTo(0.5, 0.5);

        // prikazi go barot za progress 
        var progress = game.add.sprite(game.world.centerX, 400, 'progress');
        progress.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progress);

        // izvleci gi site potrebni resursi za igrata
        //game.load.tilemap('map1','resursi/tilemap.json',null,Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('mapa1','resursi/maps/map1.json',null,Phaser.Tilemap.TILED_JSON);
        // level 1 platform
        game.load.image('sheet1','resursi/maps/sheet1.png');  
        game.load.image('bg-img','resursi/maps/bg-img.png');
        game.load.image('enemy_fruit','resursi/maps/enemy_fruit.png');  
        game.load.image('spike-sheet','resursi/maps/spike-sheet.png'); 
        game.load.image('fruit','resursi/maps/apple.png');  


        game.load.spritesheet('igrac', 'resursi/igrac/spritesheet.png',98,110);
        game.load.image('neprijatel', 'resursi/neprijatel.png');
        game.load.image('zivot','resursi//igrac/zivot.png');
        game.load.image('puka','resursi/igrac/shoot.png');
        game.load.image('strelki','resursi/strelki.png');
        game.load.image('wasd','resursi/wasd.png');
        game.load.image('enter','resursi/enter.png');
        game.load.image('space','resursi/space.png');
        game.load.audio('skoka', ['resursi/audio/skoka.ogg', 'resursi/audio/skoka.mp3']);
        game.load.audio('zemaParicka', ['resursi/audio/zemaParicka.ogg', 'resursi/audio/zemaParicka.mp3']);
        game.load.audio('mrtovNeprijatel', ['resursi/audio/mrtovNeprijatel.ogg', 'resursi/audio/mrtovNeprijatel.mp3']);
        game.load.audio('mrtovIgrac', ['resursi/audio/mrtovIgrac.ogg', 'resursi/audio/mrtovIgrac.mp3']);

    },
    create: function() {
        // startuvaj sledna sostojba
        game.state.start('level1');
    }
};
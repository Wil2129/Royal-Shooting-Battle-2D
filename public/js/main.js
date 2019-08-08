var db = firebase.database();

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var playersRef = db.ref('players');
var thisPlayer;
var thisPlayerRef = playersRef.push();
var otherPlayers = {};
var cursors;
var lastWrite = 0;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
}

function create() {

    this.add.image(0, 0, 'background').setOrigin(0, 0);

    thisPlayer = this.matter.add.sprite(400, 300, 'player').setInteractive();
    thisPlayerRef.set({
        x: thisPlayer.x,
        y: thisPlayer.y,
        rotation: thisPlayer.rotation
    });

    playersRef.on('child_added', function (data) {
        if (data.key != thisPlayerRef.key) {
            otherPlayers[data.key] = game.scene.scenes[0].matter.add.sprite(data.val().x, data.val().y, 'player').setRotation(data.val().rotation).setInteractive();
        }
    });
    playersRef.on('child_changed', function (data) {
        if (data.key != thisPlayerRef.key) {
            otherPlayers[data.key].x = data.val().x;
            otherPlayers[data.key].y = data.val().y;
            otherPlayers[data.key].rotation = data.val().rotation;
        }
    });
    playersRef.on('child_removed', function (data) {
        if (data.key != thisPlayerRef.key) {
            otherPlayers[data.key].destroy();
        }
    });

    cursors = this.input.keyboard.createCursorKeys();

}

function update(time, delta) {

    thisPlayer.setVelocity(0, 0);

    if (cursors.left.isDown) {
        thisPlayer.setVelocityX(-1);
    } else if (cursors.right.isDown) {
        thisPlayer.setVelocityX(1);
    }
    if (cursors.up.isDown) {
        thisPlayer.setVelocityY(-1);
    } else if (cursors.down.isDown) {
        thisPlayer.setVelocityY(1);
    }

    this.input.on('pointermove', function (pointer) {

        thisPlayer.rotation = Phaser.Math.Angle.Between(thisPlayer.x, thisPlayer.y, pointer.x, pointer.y) + Math.PI / 2;

    }, this);

    thisPlayerRef.update({
        x: thisPlayer.x,
        y: thisPlayer.y,
        rotation: thisPlayer.rotation
    });

    window.addEventListener('unload', function (event) {
        thisPlayerRef.remove();
    });

}
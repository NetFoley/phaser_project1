let cursors;
let aliens = [];
let scene = undefined;
let moveToCursor = false;
let mouseX = 0;
let mouseY = 0;
let alienAlive = 0;
let humanAlive = 1;
let currentLevel = 0;
let keyboard;
let alienFocus = 0;

let entityCost = 15;
let lifeCost = 5;
let detectRangeCost = 1;
let rangeCost = 25;
let damageCost = 12;
let attackDelayCost = 600;
let callForHelpCost = 250;
let canChargeCost = 900;
let explosionCost = 2000;
let zombieCost = 3000;

let money = levels[currentLevel].money;
let globalMoney = levels[currentLevel].globalMoney;
let flag;
function create()
{
    scene = this;
    //  Input Events
    cursors = this.input.mouse;
    keyboard = this.input.keyboard.addKeys({
    one:  Phaser.Input.Keyboard.KeyCodes.ONE,
    two:  Phaser.Input.Keyboard.KeyCodes.TWO,
    three:  Phaser.Input.Keyboard.KeyCodes.THREE,
    four:  Phaser.Input.Keyboard.KeyCodes.FOUR,
    five:  Phaser.Input.Keyboard.KeyCodes.FIVE,
    six:  Phaser.Input.Keyboard.KeyCodes.SIX,
    seven:  Phaser.Input.Keyboard.KeyCodes.SEVEN,
    height:  Phaser.Input.Keyboard.KeyCodes.HEIGHT,
    nine:  Phaser.Input.Keyboard.KeyCodes.NINE,
    zero:  Phaser.Input.Keyboard.KeyCodes.ZERO
});
    game.anims.create({
      key: 'left',
      frames: game.anims.generateFrameNumbers('forest_sheet', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    game.anims.create({
      key: 'turn',
      frames: [ { key: 'forest_sheet', frame: 0 } ],
      frameRate: 10
    });

    game.anims.create({
      key: 'right',
      frames: game.anims.generateFrameNumbers('forest_sheet', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });


  this.add.image(WIDTH/2, HEIGHT/2, 'sky');
  flag = this.add.image(WIDTH/2, HEIGHT/2, 'star');

  for(let i = 0; i < levels[currentLevel].nbr; i++)
    addCharacter("human",
    levels[currentLevel].life,
    levels[currentLevel].detect,
    levels[currentLevel].range,
    levels[currentLevel].damage,
    levels[currentLevel].attackDelay,
    levels[currentLevel].callForHelp,
    levels[currentLevel].canCharge,
    levels[currentLevel].explosion,
    levels[currentLevel].zombie
  );

  money = levels[currentLevel].money;
  globalMoney = levels[currentLevel].globalMoney;

  updateArmyMoney();
  let repartitionBox = document.getElementById("repartitionBox");
  for(let i = 0; i< repartitionBox.children.length; i++){
      if(repartitionBox.children[i].tagName == "INPUT"){
        for(let j = 0; j < repartitionBox.children[i].value; j++)
        {
          addCharacter(repartitionBox.children[i].id.split("_"),
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_lifeInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_detectRangeInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_rangeInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_damageInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_attackDelayInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_callForHelpCheck").checked,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_canChargeCheck").checked,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_explosionCheck").checked,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_zombieCheck").checked
        );
        }
      }
    }

  flag.setVisible(false);
  this.input.on('pointerdown', function(pointer){
    moveToCursor = true;
  }, this);
  this.input.on('pointerup', function(pointer){
    moveToCursor = false;
  }, this);
  this.input.on('pointerup', function(pointer){
    moveToCursor = false;
  }, this);
  this.input.on('pointermove', function(pointer){
    mouseX = pointer.x;
    mouseY = pointer.y;
  }, this);

  document.getElementById("startButton").innerHTML = "Reset level";
}

function moveAliensTo(x, y, nbr = "0"){
  for(var i = 0; i < characters.length; i++){
    if(String(characters[i].type).slice(0,5) == "alien" && nbr == "0" || String(characters[i].type).slice(5,6) == nbr){
      characters[i].homeX = x;
      characters[i].homeY = y;
    }
  }
}

function update(){
  alienAlive = 0;
  humanAlive = 0;
  if(keyboard.one.isDown){
    selectAlien("1");
  }
  if(keyboard.two.isDown){
    selectAlien("2");
  }
  if(keyboard.three.isDown){
    selectAlien("3");
  }
  if(keyboard.four.isDown){
    selectAlien("4");
  }
  if(keyboard.five.isDown){
    selectAlien("5");
  }
  if(keyboard.six.isDown){
    selectAlien("6");
  }
  if(keyboard.seven.isDown){
    selectAlien("7");
  }
  if(keyboard.height.isDown){
    selectAlien("8");
  }
  if(keyboard.nine.isDown){
    selectAlien("9");
  }
  if(keyboard.zero.isDown){
    selectAlien("0");
  }

  if(moveToCursor)
  {
    flag.setVisible(true);
    flag.x = mouseX;
    flag.y = mouseY;
    moveAliensTo(mouseX, mouseY, alienFocus);
  }
  for(let i = 0; i < characters.length; i++)
  {
    if(characters[i].alive())
    {
      if(String(characters[i].type).slice(0,5) == "alien")
        alienAlive++;
      if(String(characters[i].type).slice(0,5) == "human")
        humanAlive++;

      if(!(characters[i].stunned()))
      {
        if(characters[i].moving())
        {
          characters[i].sprite.setVelocityX(characters[i].getSpeedX() * characters[i].speed);
          characters[i].sprite.setVelocityY(characters[i].getSpeedY() * characters[i].speed);
        }
        else {
          characters[i].sprite.setVelocityX(0);
          characters[i].sprite.setVelocityY(0);
        }
      }
    }

    if(Math.random() < 0.03)
    {
      for(let j = 0; j < characters.length; j++)
      {
        characters[i].getTarget(characters[j]);
      }
    }

    characters[i].simulate();
  }

  document.getElementById("alienNbr").innerHTML = "Alien (" + alienAlive + ")";
  document.getElementById("humanNbr").innerHTML = "Human (" + humanAlive + ") ";
  if(humanAlive <= 0){
    document.getElementById("startButton").innerHTML = "Next level";
    document.getElementById("startButton").style.fontSize = "1.5em";
  }
}

function selectAlien(nbr)
{
    alienFocus = nbr;
    let boxes = document.getElementsByClassName("tabcontent");

    for(let i = 0; i < boxes.length; i++){
      if(document.getElementById(boxes[i].id+"_repartitionText") != null)
      {
        document.getElementById(boxes[i].id+"_repartitionText").style.fontWeight = "normal";
      }
    }

    if(nbr == "0"){
      for(let i = 0; i < boxes.length; i++){
          if(document.getElementById(boxes[i].id+"_repartitionText") != null){
              document.getElementById(boxes[i].id+"_repartitionText").style.fontWeight = "bold";
          }
      }
    }
    else {
      if(document.getElementById("alien"+nbr+"_repartitionText"))
        document.getElementById("alien"+nbr+"_repartitionText").style.fontWeight = "bold";
    }

}

function addCharacter(type = "human", life=1, detect=1, range=1, damage=1, attackDelay=0.3, callForHelp=false, canCharge=false, explosion = false, zombie=false)
{
    let x = 0;
    let y = 0;
    let stayHome = false;
    let tint = 0x44FF44;
    if(String(type).slice(0, 5) == "human")
    {
      x = 0-Math.random()*300+WIDTH;
      y = Math.random()*HEIGHT+0;
      tint = 0xFFFFFF;
    }
    if(String(type).slice(0,5) == "alien")
    {
      x = Math.random()*300;
      y = Math.random()*HEIGHT+0;
      tint = 0x44FF44;
      stayHome = true;
    }
    characters.push(new gameObject(scene, x, y, type, tint,
    life,
    detect,
    range,
    damage,
    1000/attackDelay,
    callForHelp,
    canCharge,
    explosion,
    zombie,
    stayHome
    ));
}

function updateArmyMoney()
{
    let totalCost = 0;
    let box = document.getElementById("repartitionBox");
    for(let i = 0; i< box.children.length; i++){
        if(box.children[i].tagName == "INPUT"){
          let cost = money - getRemainingMoney(document.getElementById(box.children[i].id.split("_")[0]));
          totalCost += cost * box.children[i].value;
        }
    }
    for(let i = 0; i< box.children.length; i++){
        if(box.children[i].tagName == "INPUT"){
          let cost = money - getRemainingMoney(document.getElementById(box.children[i].id.split("_")[0]));
          box.children[i].max = ((globalMoney - totalCost)+box.children[i].value*cost) / cost;
          document.getElementById(box.children[i].id.split("_")[0] + "_repartitionText").innerHTML = box.children[i].value + " (" + box.children[i].id.split("_")[0] + ")";
        }
    }
    if(globalMoney - totalCost < 0){
      console.log(box);
    }
    document.getElementById("armyMoney").innerHTML = "Budget total restant :" + (globalMoney - totalCost);

}

function updateMoney(box)
{
    let remainingMoney = getRemainingMoney(box);
    document.getElementById(box.id + "_damageInput").max = (remainingMoney+document.getElementById(box.id + "_damageInput").value*damageCost) / damageCost;
    document.getElementById(box.id + "_lifeInput").max = (remainingMoney+document.getElementById(box.id + "_lifeInput").value*lifeCost) / lifeCost;
    document.getElementById(box.id + "_detectRangeInput").max = Math.min((remainingMoney+document.getElementById(box.id + "_detectRangeInput").value*detectRangeCost) / detectRangeCost, 1000);
    document.getElementById(box.id + "_rangeInput").max = (remainingMoney+document.getElementById(box.id + "_rangeInput").value*rangeCost) / rangeCost;
    document.getElementById(box.id + "_attackDelayInput").max = (remainingMoney+document.getElementById(box.id + "_attackDelayInput").value*attackDelayCost) / attackDelayCost;
    if(remainingMoney < callForHelpCost && document.getElementById(box.id + "_callForHelpCheck").checked == false)
      document.getElementById(box.id + "_callForHelpCheck").disabled = true;
      else {
        document.getElementById(box.id + "_callForHelpCheck").disabled = false;
      }
    if(remainingMoney < canChargeCost && document.getElementById(box.id + "_canChargeCheck").checked == false)
      document.getElementById(box.id + "_canChargeCheck").disabled = true;
      else {
        document.getElementById(box.id + "_canChargeCheck").disabled = false;
      }
    if(remainingMoney < zombieCost && document.getElementById(box.id + "_zombieCheck").checked == false)
      document.getElementById(box.id + "_zombieCheck").disabled = true;
      else {
        document.getElementById(box.id + "_zombieCheck").disabled = false;
      }
    if(remainingMoney < explosionCost && document.getElementById(box.id + "_explosionCheck").checked == false)
      document.getElementById(box.id + "_explosionCheck").disabled = true;
      else {
        document.getElementById(box.id + "_explosionCheck").disabled = false;
      }

    //Update display
    document.getElementById(box.id + "_lifeText").innerHTML = "Life :" + document.getElementById(box.id + "_lifeInput").value;
    document.getElementById(box.id + "_damageText").innerHTML = "Damage :" + document.getElementById(box.id + "_damageInput").value;
    document.getElementById(box.id + "_detectRangeText").innerHTML = "Vision range :" + document.getElementById(box.id + "_detectRangeInput").value;
    document.getElementById(box.id + "_rangeText").innerHTML = "Attack range :" + document.getElementById(box.id + "_rangeInput").value;
    document.getElementById(box.id + "_attackDelayText").innerHTML = "Attack speed :" + document.getElementById(box.id + "_attackDelayInput").value;
    document.getElementById(box.id + "_callForHelpText").innerHTML = "Call for help -" + callForHelpCost;
    document.getElementById(box.id + "_canChargeText").innerHTML = "Charge attack -" + canChargeCost;
    document.getElementById(box.id + "_zombieText").innerHTML = "Zombie bite -" + zombieCost;
    document.getElementById(box.id + "_explosionText").innerHTML =
    "Explosion -" + explosionCost + "("+ getExplosionDamage(document.getElementById(box.id + "_lifeInput").value, document.getElementById(box.id + "_damageInput").value) + " damage)";
    document.getElementById(box.id + "_moneyAmount").innerHTML = "Co??t d'un alien : " + (money - remainingMoney) + "/" + money + " (" + box.id.split("_")[0]+")";
    updateArmyMoney();
}

function explode(object, damage){
  for(let i = 0; i < characters.length; i++){
    let dmgToChar = damage/(Math.max(1,(characters[i].getDistance(object)- object.getRange()*10)*Math.sqrt(characters[i].getDistance(object)) - object.getRange()*10));
    if(dmgToChar > 5 && characters[i].alive() && object != characters[i]){
      if(characters[i].getType() == object.getType()){
        dmgToChar*=0.5;
      }
      characters[i].hit(dmgToChar,object);
    }
  }
}

function getExplosionDamage(life, damage)
{
  return parseInt(life)*0.3  + parseInt(damage)*2.5;
}

function getRemainingMoney(box)
{
  let cost = 0;
  for(let i = 0; i < box.children.length; i++)
  {
    if(box.children[i].tagName == "INPUT")
    {
      if(box.children[i].type=='range')
        cost += box.children[i].value * eval(box.children[i].id.split("_")[1].slice(0,-5)+"Cost");
      else {
        cost += box.children[i].checked * eval(box.children[i].id.split("_")[1].slice(0,-5)+"Cost");
      }
    }
  }
  return money - cost;
}

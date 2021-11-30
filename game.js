let cursors;
let aliens = [];
let scene = undefined;
let moveToCursor = false;
let mouseX = 0;
let mouseY = 0;
let alienAlive = 0;
let humanAlive = 1;
let currentLevel = 0;

let entityCost = 15;
let lifeCost = 5;
let detectRangeCost = 1;
let rangeCost = 10;
let damageCost = 10;
let attackDelayCost = 300;
let callForHelpCost = 150;
let canChargeCost = 750;
let zombieCost = 2000;


    let levels = [{
      "globalMoney": 50000,
      "money": 2000,
      "nbr": 15,
      "life": 100,
      "detect": 200,
      "range": 10,
      "damage": 5,
      "attackDelay": 0.2,
      "callForHelp": false,
      "canCharge": false,
      "zombie": false
    },
    {
      "globalMoney": 100000,
      "money": 3000,
      "nbr": 35,
      "life": 100,
      "detect": 50,
      "range": 10,
      "damage": 10,
      "attackDelay": 0.3,
      "callForHelp": false,
      "canCharge": false,
      "zombie": false},
    {
      "globalMoney": 120000,
      "money": 5000,
      "nbr": 50,
      "life": 200,
      "detect": 200,
      "range": 20,
      "damage": 5,
      "attackDelay": 0.4,
      "callForHelp": true,
      "canCharge": false,
      "zombie": false},
    {
      "globalMoney": 150000,
      "money": 5000,
      "nbr": 1,
      "life": 10000,
      "detect": 500,
      "range": 150,
      "damage": 100,
      "attackDelay": 2,
      "callForHelp": true,
      "canCharge": true,
      "zombie": false}
  ];
let money = levels[currentLevel].money;
let globalMoney = levels[currentLevel].globalMoney;
function create()
{
    scene = this;
    //  Input Events
    cursors = this.input.mouse;
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


  this.add.image(500, 400, 'sky');

  for(let i = 0; i < levels[currentLevel].nbr; i++)
    addCharacter("human",
    levels[currentLevel].life,
    levels[currentLevel].detect,
    levels[currentLevel].range,
    levels[currentLevel].damage,
    levels[currentLevel].attackDelay,
    levels[currentLevel].callForHelp,
    levels[currentLevel].canCharge,
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
          addCharacter("alien",
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_lifeInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_detectRangeInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_rangeInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_damageInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_attackDelayInput").value,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_callForHelpCheck").checked,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_canChargeCheck").checked,
          document.getElementById(repartitionBox.children[i].id.split("_")[0]+"_zombieCheck").checked
        );
        }
      }
    }

  this.input.on('pointerdown', function(pointer){
    moveToCursor = true;
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

function moveAliensTo(x, y)
{
  for(var i = 0; i < characters.length; i++)
  {
    if(characters[i].type == "alien")
    {
      characters[i].homeX = x;
      characters[i].homeY = y;
    }
  }
}

function update()
{
  alienAlive = 0;
  humanAlive = 0;
  if(moveToCursor)
  {
    moveAliensTo(mouseX, mouseY);
  }
  for(let i = 0; i < characters.length; i++)
  {
    if(characters[i].alive())
    {
      if(characters[i].type == "alien")
        alienAlive++;
      if(characters[i].type == "human")
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
  if(humanAlive <= 0)
    document.getElementById("startButton").innerHTML = "Next level";
}

function addCharacter(type = "human", life=1, detect=1, range=1, damage=1, attackDelay=0.3, callForHelp=false, canCharge=false, zombie=false)
{
    let x = 0;
    let y = 0;
    let stayHome = false;
    let tint = 0x44FF44;
    if(type == "human")
    {
      x = 0-Math.random()*300+WIDTH;
      y = Math.random()*HEIGHT+0;
      tint = 0xFFFFFF;
    }
    if(type == "alien")
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

    document.getElementById("armyMoney").innerHTML = "Money left :" + (globalMoney - totalCost);

}

function updateMoney(box)
{
    let remainingMoney = getRemainingMoney(box);
    document.getElementById(box.id + "_damageInput").max = (remainingMoney+document.getElementById(box.id + "_damageInput").value*damageCost) / damageCost;
    document.getElementById(box.id + "_lifeInput").max = (remainingMoney+document.getElementById(box.id + "_lifeInput").value*lifeCost) / lifeCost;
    document.getElementById(box.id + "_detectRangeInput").max = (remainingMoney+document.getElementById(box.id + "_detectRangeInput").value*detectRangeCost) / detectRangeCost;
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

    //Update display
    document.getElementById(box.id + "_lifeText").innerHTML = "Life :" + document.getElementById(box.id + "_lifeInput").value;
    document.getElementById(box.id + "_damageText").innerHTML = "Damage :" + document.getElementById(box.id + "_damageInput").value;
    document.getElementById(box.id + "_detectRangeText").innerHTML = "Vision range :" + document.getElementById(box.id + "_detectRangeInput").value;
    document.getElementById(box.id + "_rangeText").innerHTML = "Attack range :" + document.getElementById(box.id + "_rangeInput").value;
    document.getElementById(box.id + "_attackDelayText").innerHTML = "Attack speed :" + document.getElementById(box.id + "_attackDelayInput").value;
    document.getElementById(box.id + "_callForHelpText").innerHTML = "Call for help -" + callForHelpCost;
    document.getElementById(box.id + "_canChargeText").innerHTML = "Charge attack -" + canChargeCost;
    document.getElementById(box.id + "_zombieText").innerHTML = "Zombie bite -" + zombieCost;
    document.getElementById(box.id + "_moneyAmount").innerHTML = "Cost :" + (money - remainingMoney) + "/" + money + " (" + box.id.split("_")[0]+")";
    updateArmyMoney();
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

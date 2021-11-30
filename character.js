function newHuman(game, x, y)
{
  let human = new gameObject(game, x, y);
  human.speed = 20;

  return human;
}
function newAlien(game, x, y, life, detectRange, range, damage, attackDelay, callForHelp, chargeAttack, zombieBite)
{
  let alien = new gameObject(game, x, y, "alien", 0x44FF44, life, detectRange, range, damage, attackDelay, callForHelp, chargeAttack, zombieBite, true);

  return alien;
}

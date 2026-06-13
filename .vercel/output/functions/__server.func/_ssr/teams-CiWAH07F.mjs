const OPEN_BUDGET = 5e4;
function team(id, name, captain, mentor, budget = OPEN_BUDGET) {
  return { id, name, captain, mentor, maxPlayers: 15, logoUrl: "", budget };
}
const TEAMS_BY_AUCTION = {
  open: [
    team("spain", "Spain", "Ishayu Bose", "Abhinav Mangrati"),
    team("brazil", "Brazil", "Siddhant Singh", "Siddhartha Ghosh"),
    team("france", "France", "Priyangshu Karmakar", "Krishnendu hazra"),
    team("argentina", "Argentina", "Subham saroj", "Shourya Shikhar Singh"),
    team("portugal", "Portugal", "Praadyun dasgupta", "Krish"),
    team("netherlands", "Netherlands", "Ronit Das", "Abir Roy"),
    team("germany", "Germany", "Piyush Kumar", "Jonty"),
    team("england", "England", "Ojas Tiwari", "Aniruddha")
  ]
};
function getTeamsForAuction(type) {
  return TEAMS_BY_AUCTION[type] ?? [];
}
export {
  getTeamsForAuction as g
};

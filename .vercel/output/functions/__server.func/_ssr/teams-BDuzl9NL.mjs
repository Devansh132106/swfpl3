const OPEN_BUDGET = 5e4;
function flagUrl(countryCode) {
  return `https://flagcdn.com/w80/${countryCode}.png`;
}
function team(id, name, captain, mentor, countryCode, budget = OPEN_BUDGET) {
  return {
    id,
    name,
    captain,
    mentor,
    maxPlayers: 15,
    logoUrl: flagUrl(countryCode),
    budget
  };
}
const TEAMS_BY_AUCTION = {
  open: [
    team("spain", "Spain", "Ishayu Bose", "Abhinav Mangrati", "es"),
    team("brazil", "Brazil", "Siddhant Singh", "Siddhartha Ghosh", "br"),
    team("france", "France", "Priyangshu Karmakar", "Krishnendu hazra", "fr"),
    team("argentina", "Argentina", "Subham saroj", "Shourya Shikhar Singh", "ar"),
    team("portugal", "Portugal", "Praadyun dasgupta", "Krish", "pt"),
    team("netherlands", "Netherlands", "Ronit Das", "Abir Roy", "nl"),
    team("germany", "Germany", "Piyush Kumar", "Jonty", "de"),
    team("england", "England", "Ojas Tiwari", "Aniruddha", "gb-eng")
  ]
};
function getTeamsForAuction(type) {
  return TEAMS_BY_AUCTION[type] ?? [];
}
export {
  getTeamsForAuction as g
};

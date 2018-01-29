import axios from 'axios';

const id = "1c6c484b55e3c0ad04cc";
const sec = "e78e4edc1527f3c3808440593eb21848c1ad66c3";
const params = `?client_id=${id}&client_secret=${sec}`;

async function getProfile(username) {
	const profile = await axios.get(`https://api.github.com/users/${username}${
		params}`)

	return profile.data;
}

function getRepos(username) {
	return axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`);
}

function getStarCount(repos) {
	return repos.data.reduce((count, { stargazers_count }) => count + stargazers_count, 0)
}

function caculateScore({ followers }, repos) {
	return (followers * 3) + getStarCount(repos);
}

function handleError(error) {
	console.warn(error);
	return null;
}

async function getUserData(player) {
	const [ profile, repos ] = await Promise.all([
		getProfile(player),
		getRepos(player)
	])

	return {
		profile,
		score: caculateScore(profile, repos)
	}

	// .then(function(data) {
	// 	var profile = data[0];
	// 	var repos = data[1];

	// 	return {
	// 		profile: profile,
	// 		score: caculateScore(profile, repos)
	// 	}
	// })
}

function sortPlayers(players) {
	return players.sort((a,b) => b.score - a.score);
}

export async function battle(players) {
	const results = await Promise.all(players.map(getUserData))
		.catch(handleError);

	return results === null
		? results
		: sortPlayers(results);
}

export async function fetchPopularRepos(language) {
    const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

    const repos = await axios.get(encodedURI)
    	.catch(handleError);

    return repos.data.items;
}
const axios = require("axios");

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
  };
  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {


const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': 'b7055c95acmsh34946e84e4e6f61p1448adjsn7ebce46cd253',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
   submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();
};

const waiting = async (timer) => {
  setTimeout(() => {
    return 1;
  }, timer);
};

const submitToken = async (resultToken) => {


const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': 'b7055c95acmsh34946e84e4e6f61p1448adjsn7ebce46cd253',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

while (true) {
  const result = await fetchData();
  const IsResultObtained = result.submissions.every((r) => r.status_id > 2);
  if (IsResultObtained) return result.submissions;
  await delay(1000); // wait 1 second before polling again
}


  await waiting(1000);
};

module.exports = { getLanguageById, submitBatch, submitToken };

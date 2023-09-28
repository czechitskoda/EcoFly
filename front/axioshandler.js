import axios from "axios";
let adress = "https://skoda-back.homepi.party/api/questions/"

export async function getQuestion(qnum) {
  console.log("Axios get question")
  try {
    const response = await axios.get(adress + String(qnum));
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function answerQuestion(index, answer) {
  console.log("Axios get answer")
   try {
    const response = await axios.get(adress + 'correct/', { params: { i: index, a: answer } });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function Score() {
   try {
    const response = await axios.get(adress + 'score/');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function QuestionsLength() {
   try {
    const response = await axios.get(adress + 'length/');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

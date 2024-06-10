import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let authPayload = JSON.stringify({
    email: 'testcoba@gmail.com',
    password: 'testcoba',
  });

  let authHeaders = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let authRes = http.post('http://localhost:6000/api/auth/login', authPayload, authHeaders);
  console.log(`Auth Response: ${authRes.status} - ${authRes.body}`);
  check(authRes, {
    'login successful': (r) => r.status === 200,
  });

  if (authRes.status !== 200) {
    console.error('Login failed');
    return;
  }

  let authToken = authRes.json('token');
  let params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  let quizRes = http.get('http://localhost:7000/api/quiz/quiz-questions/6658ab14288c86850d40a135', params);
  console.log(`Quiz Response: ${quizRes.status} - ${quizRes.body}`);
  check(quizRes, {
    'get quizzes successful': (r) => r.status === 200,
  });

  let scorePayload = JSON.stringify({
    userId: "66572602c35ef8fcc617e9c6",
    quizId: "6658ab14288c86850d40a135",
    answerId: "665b2fcbf3902c44fb57e164",
  });

  let scoreRes = http.post('http://localhost:8000/api/score/grade', scorePayload, params);
  console.log(`Score Response: ${scoreRes.status} - ${scoreRes.body}`);
  check(scoreRes, {
    'submit score successful': (r) => r.status === 200,
  });

  sleep(1);
}

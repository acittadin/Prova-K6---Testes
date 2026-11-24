import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getPostsDuration = new Trend('get_posts', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    http_req_duration: ['p(90)<6800'],
    get_posts: ['p(90)<6800'],
    content_OK: ['rate>0.75']
  },
  stages: [
    { duration: '30s', target: 7 },
    { duration: '2m', target: 92 },
    { duration: '1m', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://jsonplaceholder.typicode.com/posts';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getPostsDuration.add(res.timings.duration);
  RateContentOK.add(res.status === OK);

  check(res, {
    'GET Posts - Status 200': () => res.status === OK
  });
}

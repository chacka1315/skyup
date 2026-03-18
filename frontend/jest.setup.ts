import "@testing-library/jest-dom";

// Block all real network requests in tests.
// Components using useQuery will attempt fetches when no data is preloaded —
// this prevents jsdom from making real XHR calls and logging AggregateError.
jest.mock("@/lib/axios/axios-client", () => ({
  clientAxios: {
    get: jest.fn().mockRejectedValue(new Error("Network calls not allowed in tests")),
    post: jest.fn().mockRejectedValue(new Error("Network calls not allowed in tests")),
    put: jest.fn().mockRejectedValue(new Error("Network calls not allowed in tests")),
    delete: jest.fn().mockRejectedValue(new Error("Network calls not allowed in tests")),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

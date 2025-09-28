const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const workouts = require("./data/workouts.js");

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  const result = await api
    .post("/api/user/signup")
    .send({ email: "mattiv@matti.fi", password: "R3g5T7#gh" });
  token = result.body.token;
});


describe("when there is initially some workouts saved", () => {
  beforeEach(async () => {
    await Workout.deleteMany({});
    await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(workouts[0])
      .send(workouts[1]);
  });

  describe("When a client wants to get the workouts")
    it(" Should return Workouts as JSON", async () => {
      await api
        .get("/api/workouts")
        .set("Authorization", "bearer " + token)
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

  describe("When a new workout is added", () => {
    it("Should successfully save the new workout", async () => {
      const newWorkout = {
      title: "testworkout",
      reps: 10,
      load: 100,
    };
    await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(newWorkout)
      .expect(201);
  });
  });
});

describe('WHen there is an existing workout', () => {
  let workout;

  beforeEach(async() => {
    await Workout.deleteMany({});

    const response = await api
      .post('/api/workouts')
      .set('Authorization', 'bearer' + 'token')
      .set(workouts[0]);

      workout = response.body;
      console.log(workout._id);
  })
})

describe('when a delete request is sent to the api', () => {
  it('should delete a workout successfully with status 204', async () => {
    await api
    .delete(`/api/workouts/${workoutId}`)
    .set('Authorization', 'bearer' + token)
    .expect(204);

    const response = await api
    .get(`/api/workouts/${workoutId}`)
    .set('Authorization', 'bearer' + token)
    .expect(204);
  })
})



afterAll(() => {
  mongoose.connection.close();
});

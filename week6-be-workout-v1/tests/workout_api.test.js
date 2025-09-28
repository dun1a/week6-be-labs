const mongoose = require("mongoose");
const supertest = require("supertest"); // library for simulating HTTP requests to Express app in tests
const app = require("../app");
const api = supertest(app); // wraps app so .get() and other things can be called
const Workout = require("../models/workoutModel");


// small array for workouts that wil be inserted in db before each test
// insures tests always start with known predictable start
const initialWorkouts = [
  {
    title: "test workout 1",
    reps: 11,
    load: 101,
  },
  {
    title: "test workout 2",
    reps: 12,
    load: 102,
  },
];

// fetches all workouts in db currently
const workoutsInDb = async () => {
  const workouts = await Workout.find({});
  // converts workouts to plain JSON pbjects ( instead of mongoose docs)
  return workouts.map((workout) => workout.toJSON()); 
};

// before each hook
// runs before every test done
beforeEach(async () => {
  // deletes workouts collection
  await Workout.deleteMany({}); 
  // inserts the two available initialWorkoutsso each test 
  // starts eaxaxtly with 2 workouts in the db
  let workoutObject = new Workout(initialWorkouts[0]);
  await workoutObject.save();
  workoutObject = new Workout(initialWorkouts[1]);
  await workoutObject.save();
});


///////////////
// TESTS FOR READING WORKOUTS  (GET ?)
describe("when there is initially some workouts saved", () => {
  // first test: return all workouts
  it("should return all workouts", async () => {
    console.log("entered test");
    const response = await api
    // api .get("/api/workouts"); uses supertest to send GET request to the API endpoint
    .get("/api/workouts");
    // the parsed JSON response from the server
    expect(response.body) 
    // asserts that the number of workouts returned must match the number of workouts 
    // seeded in the begginning (initialWorkouts.lengths, in this case 2)
    .toHaveLength(initialWorkouts.length);
  });

  // second test: check for a specific workout
  it("should include a specific workout is within the returned workouts", async () => {
    console.log("entered test");
    const response = await api
    // GET request sent to api/workouts
    .get("/api/workouts");
    // extracts just the title field from each workout in the reponse 
    const contents = response.body.map((r) => r.title);
    // checks that one of the returned workouts has the title 'test workout 2'
    expect(contents).toContain("test workout 2");
  });

  // third test: check JSON format and status
  it(" should return workouts as JSON", async () => {
    console.log("entered test");
    await api
    // another GET request to /api/workouts
      .get("/api/workouts")
      .expect(200)
      // asserts that hte response header indicates JSON data
      .expect("Content-Type", /application\/json/);
  });
});
//_____________________________________________________________________________

// TESTS FOR ADDING WROKOUTS
// POST requests
  describe("When new workout is added ", () => {
    // first test: adding workout successfully
    it('should add a new workout successfully', async() => {
      console.log("entered test");
      // addes the contents for the new workout object
      const newWorkout = {
      title: "test workout x",
      reps: 19,
      load: 109,
    };
    await api
    // send POST request to create a new workout
    .post("/api/workouts")
    // attaches the workout data in the request body
    .send(newWorkout)
    .expect(201);
    // this test checks that the API accepts a valid workout and respnds correctly
  });

    // second test: adding workout increase the count
    it(" should add a valid workout and increase the count", async () => {
      console.log("entered test");
      // creates another valid workout
      const newWorkout = {
        title: "Situps",
        reps: 25,
        load: 10,
      };

      await api
      // makes POST request
        .post("/api/workouts")
        .send(newWorkout)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      // after getting a response => fetches all workouts with GET
      const response = await api
      .get("/api/workouts");
      // extracts all workout titles
      const contents = response.body.map((r) => r.title);

      expect(response.body)
      .toHaveLength(initialWorkouts.length + 1);
      expect(contents)
      .toContain("Situps");
    });

    it("should not add a workout without a title", async () => {
      console.log("entered test");
      const newWorkout = {
        reps: 23,
      };

      await api.
      post("/api/workouts")
      .send(newWorkout)
      .expect(400);

      const response = await api
      .get("/api/workouts");
      expect(response.body).toHaveLength(initialWorkouts.length);
    });
  });



describe("deletion of a workout", () => {
    it(" should succeed with status code 204 if id is valid", async () => {
      const workoutsAtStart = await workoutsInDb();
      const workoutToDelete = workoutsAtStart[0];

      await api.delete(`/api/workouts/${workoutToDelete.id}`).expect(204);

      const workoutsAtEnd = await workoutsInDb();
      expect(workoutsAtEnd).toHaveLength(initialWorkouts.length - 1);

      const contents = workoutsAtEnd.map((r) => r.title);
      expect(contents).not.toContain(workoutToDelete.title);

      // expect(true).toBe(true);
    });
  });



afterAll(() => {
  mongoose.connection.close();
});
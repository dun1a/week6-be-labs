const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const workouts = require("./data/workouts.js");
const { getWorkout } = require("../controllers/workoutController.js");

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

    describe("When a client wants to get the workouts", () => {

      it(" Should return Workouts as JSON", async () => {
        await api
          .get("/api/workouts")
          .set("Authorization", "bearer " + token)
          .expect(200)
          .expect("Content-Type", /application\/json/);
      });
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


// describe('WHen there is an existing workout', () => {
//   let deletedWorkout;

//   beforeEach(async() => {
//     await Workout.deleteMany({});

//     const response = await api
//       .post('/api/workouts')
//       .set('Authorization', 'bearer ' + token)
//       .send(workouts[0]);

//       deletedWorkout = response.body;
//       console.log(deletedWorkout._id);
//     })

//     describe('when a delete request is sent to the api', () => {
//       it('should delete a workout successfully with status 204', async () => {
//         await api
//         .delete(`/api/workouts/${deletedWorkout._id}`)
//         .set('Authorization', 'bearer ' + token)
//         .expect(204);

//         const isdeletedWorkout = await api
//         .get('/api/workouts/')
//         .set('Authorization', 'bearer ' + token);
//       })
//     })
//   });

// describe('When there is a workout', ()=> {
//   let workout;

//   beforeEach(async () => {
//     await Workout.deleteMany({});

//     const response = await api
//       .post('/api/workouts')
//       .set('Authorization', 'bearer ' + token)
//       .send(workouts[0]);

//     workout = response.body;
//   });

//   describe('when a client updates an existing workout', () => {
//     it('should return the updated workout with status 200', async () => {
//       const updatedworkout = { title: "Updated", reps: 50, load: 200 };;

//       const response = await api
//       .put(`/api/workouts/${workout._id}`)
//       .set("Authorization", "bearer " + token)
//       .send(updatedworkout)
//       .expect(200);

//       expect(response.body.title).toBe(updatedworkout.title);
//       expect(response.body.reps).toBe(updatedworkout.reps);
//       expect(response.body.load).toBe(updatedworkout.load);
//     })
//   })
// });

// describe('When getting a workout by id', () => {
//   let getworkout;

//   beforeEach(async () => {
//     await Workout.deleteMany({});

//     const response = await api
//       .get(`/api/workouts/${getworkoutId}`)
//       .set("Authorization", "bearer " + token)
//       .expect(workouts[0]);
    
//     getworkout = response.body;

//   })
//   describe('WHen client tries to get a workout by ID', () => {
//     it("should return the correct workout with status 200", async () => {
//       const response = await api
//         .get(`/api/workouts/${getworkoutId}`)
//         .set("Authorization", "bearer " + token)
//         .expect(200);

//       expect(response.body.title).toBe(getworkout.title);
//       expect(response.body.reps).toBe(getworkout.reps);
//       expect(response.body.load).toBe(updatedworkout.load);
//     }) 
//   });
// });

describe('When there is an existing workout', () => {
  let workoutToDelete;

  beforeEach(async () => {
    await Workout.deleteMany({});
    const response = await api
      .post('/api/workouts')
      .set('Authorization', 'bearer ' + token)
      .send(workouts[0]);
    workoutToDelete = response.body;
  });

  it('should delete a workout successfully with status 204', async () => {
    await api
      .delete(`/api/workouts/${workoutToDelete._id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(204);

    const allWorkouts = await api
      .get('/api/workouts')
      .set('Authorization', 'bearer ' + token);

    const ids = allWorkouts.body.map(w => w._id);
    expect(ids).not.toContain(workoutToDelete._id);
  });
});

describe('When there is a workout', () => {
  let workout;

  beforeEach(async () => {
    await Workout.deleteMany({});
    const response = await api
      .post('/api/workouts')
      .set('Authorization', 'bearer ' + token)
      .send(workouts[0]);
    workout = response.body;
  });

  it('should update a workout successfully', async () => {
    const updatedWorkout = { title: "Updated", reps: 50, load: 200 };

    const response = await api
      .put(`/api/workouts/${workout._id}`)
      .set('Authorization', 'bearer ' + token)
      .send(updatedWorkout)
      .expect(200);

    expect(response.body.title).toBe(updatedWorkout.title);
    expect(response.body.reps).toBe(updatedWorkout.reps);
    expect(response.body.load).toBe(updatedWorkout.load);
  });
});

describe('When getting a workout by id', () => {
  let workout;

  beforeEach(async () => {
    await Workout.deleteMany({});
    const response = await api
      .post('/api/workouts')
      .set('Authorization', 'bearer ' + token)
      .send(workouts[0]);
    workout = response.body;
  });

  it('should return the correct workout with status 200', async () => {
    const response = await api
      .get(`/api/workouts/${workout._id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200);

    expect(response.body.title).toBe(workout.title);
    expect(response.body.reps).toBe(workout.reps);
    expect(response.body.load).toBe(workout.load);
  });
});

afterAll(() => {
  mongoose.connection.close();
});

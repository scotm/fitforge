export {
  users,
  accounts,
  accountsRelations,
  posts,
  sessions,
  sessionsRelations,
  usersRelations,
  verificationTokens,
} from "./tablesSchemas/users";

export {
  equipment,
  equipmentRelations,
  exerciseToEquipment,
  exerciseToEquipmentRelations,
  exerciseToMuscles,
  exerciseToMusclesRelations,
  exercises,
  exercisesRelations,
  licence,
  licenceRelations,
  muscles,
  musclesRelations,
  category,
  categoriesRelations,
  exerciseAlternativeNames,
  exerciseAlternativeNamesRelations,
} from "./tablesSchemas/exercises";

export {
  trainingPlan,
  workoutPieces,
  cardioWorkoutPiece,
  resistanceWorkoutPiece,
  supersetWorkoutComponents,
  supersetWorkoutPieces,
  weeklyWorkoutPlan,
} from "./tablesSchemas/trainingPlan";

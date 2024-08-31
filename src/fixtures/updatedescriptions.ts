import { db } from "../server/db";
import { exercises as exercisesTable } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { getExerciseChatCompletion } from "@/lib/llms";
import { exerciseAlternativeNames } from "~/server/db/tablesSchemas/exercises";
// import { PromisePool } from "@/lib/promises";

const exercises = await db.query.exercises.findMany({
  columns: {
    id: true,
    name: true,
  },
  orderBy: (table, { asc }) => [asc(table.name)],
});

console.log("Generating descriptions for", exercises.length, "exercises");

const exercisesToGenerate = exercises.filter(
  (exercise) => exercise.name !== null,
);

async function generateDescription(exercise: {
  id: number;
  name: string | null;
}) {
  const response = await getExerciseChatCompletion(exercise);
  if (response) {
    console.log("Inserting description for", response.name);
    await db
      .update(exercisesTable)
      .set({
        name: response.name,
        short_summary: response.short_summary,
        how_to_perform: response.how_to_perform,
      })
      .where(eq(exercisesTable.id, exercise.id));
    if (response.alternative_names && response.alternative_names.length > 0) {
      for (const alternative_name of response.alternative_names) {
        await db
          .insert(exerciseAlternativeNames)
          .values({
            exerciseId: exercise.id,
            alternativeName: alternative_name,
          })
          .onConflictDoNothing();
      }
    }
    // if (response.equipment_used.length > 0) {
    //   const equipment_available = await db.query.equipment.findMany({
    //     columns: {
    //       id: true,
    //       name: true,
    //     },
    //   });
    //   const equipmentToInsert = response.equipment_used.filter((x) => {
    //     return !equipment_available.some(
    //       (y) => y.name?.toLocaleLowerCase() === x.toLocaleLowerCase(),
    //     );
    //   });
    //   for (const equipment of equipmentToInsert) {
    //     const equipmentId = await db
    //       .insert(equipmentTable)
    //       .values({
    //         name: equipment,
    //       })
    //       .returning({ insertedId: equipmentTable.id });
    //     if (!equipmentId[0]) continue;
    //     await db.insert(exerciseToEquipment).values({
    //       equipmentId: equipmentId[0].insertedId,
    //       exerciseId: exercise.id,
    //     });
    //   }
    // }
  }
}

// const pool = new PromisePool({ concurrency: 2 });

for (const exercise of exercisesToGenerate) {
  await generateDescription(exercise);
}

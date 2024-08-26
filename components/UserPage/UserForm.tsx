/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { api, type RouterOutputs } from "~/trpc/react";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import { users } from '~/server/db/schema';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoadingSpinner } from "../LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  defaultDistanceUnit,
  defaultGenderOptions,
  defaultHeightUnit,
  defaultWeightUnit,
} from "@/lib/constants";

type User = NonNullable<Partial<RouterOutputs["user"]["get"]>>;

const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  image: z.string().url(),
  gender: z.enum(defaultGenderOptions).optional(),
  phoneNumber: z.string().min(1).max(50),
  defaultWeightUnit: z.enum(defaultWeightUnit).optional(),
  defaultDistanceUnit: z.enum(defaultDistanceUnit).optional(),
  defaultHeightUnit: z.enum(defaultHeightUnit).optional(),
  birthdate: z.date().optional(),
});

// const userSchema = createSelectSchema(users, {
//   name: z.string(),
// });

type UserFormProps = {
  user: User;
};

export const UserDetails: React.FC<UserFormProps> = ({ user }) => {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      image: user.image ?? "",
      gender: user.gender ?? undefined,
      phoneNumber: user.phoneNumber ?? "",
      defaultWeightUnit: user.defaultWeightUnit ?? "kg",
      defaultDistanceUnit: user.defaultDistanceUnit ?? "km",
      defaultHeightUnit: user.defaultHeightUnit ?? "cm",
      birthdate: user.birthdate ?? undefined,
    },
  });
  // const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const { mutate, isPending } = api.user.update.useMutation();

  // 2. Define a submit handler.
  const onSubmit = (values: z.infer<typeof userSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    mutate(values, {});
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Image
                <img src={field.value} alt="User avatar" />
              </FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your avatar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="man">Man</SelectItem>
                    <SelectItem value="woman">Woman</SelectItem>
                    <SelectItem value="non-binary">Non-Binary</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>This is your gender.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+44" {...field} />
              </FormControl>
              <FormDescription>This is your phone number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultWeightUnit"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Weight Unit</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                How do you wish to enter your weight in?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultHeightUnit"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Height Unit</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="inches">inches</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                How do you wish to enter body stats?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultDistanceUnit"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Distance Unit</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Kilometers</SelectItem>
                    <SelectItem value="miles">Miles</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                For cardio exercises, how do you wish to enter distance?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? <LoadingSpinner /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

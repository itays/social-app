"use client";

import { signupScheme, SignupValues } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { signupAction } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";
import { LoadingButton } from "@/components/LoadingButton";

export default function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupScheme),
    mode: "all",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignupValues) {
    setError("");
    startTransition(async () => {
      const { error } = await signupAction(values);
      if (error) {
        setError(error);
      }
    });
    debugger;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <p className="text-centertext-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton type="submit" className="w-full" loading={isPending}>
          Sign up
        </LoadingButton>
      </form>
    </Form>
  );
}

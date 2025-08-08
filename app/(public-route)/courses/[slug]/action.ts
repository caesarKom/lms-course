"use server";

import { requiredUser } from "@/app/data/users/required-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export async function enrollInCourseAction(
  courseId: string
): Promise<ApiResponse | never> {
  const user = await requiredUser();

  let checkoutUrl: string;

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "You have been blocked",
      };
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    let striprCustomerId: string;

    const userWithStripeCustomerId = await db.user.findUnique({
      where: { id: user.id },
      select: {
        stripeCustomerId: true,
      },
    });

    if (userWithStripeCustomerId?.stripeCustomerId) {
      striprCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      striprCustomerId = customer.id;

      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: striprCustomerId },
      });
    }

    const result = await db.$transaction(async (tx) => {
      const existingEnrollemnt = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (existingEnrollemnt?.status === "Active") {
        return {
          status: "success",
          message: "You are alredy enrolled in this Course",
        };
      }
      let enrollment;
      if (existingEnrollemnt) {
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollemnt.id,
          },
          data: {
            amount: course.price,
            status: "Pending",
            updatedAt: new Date(),
          },
        });
      } else {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            amount: course.price,
            status: "Pending",
          },
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: striprCustomerId,
        line_items: [
          {
            price: "price_1RtbxGDLm6uUzGggN3niOFop",
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: course.id,
          enrollmentId: enrollment.id,
        },
      });

      return {
        enrollment: enrollment,
        checkoutUrl: checkoutSession.url,
      };
    });

    checkoutUrl = result.checkoutUrl as string;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: "error",
        message: "Payment system error. Please try again later.",
      };
    }
    return {
      status: "error",
      message: "Failed to enroll in course!",
    };
  }

  redirect(checkoutUrl);
}

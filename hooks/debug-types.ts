
import { SessionKey } from "@mysten/seal";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

// Check if SessionKey is compatible with the error type
type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

// This line should error if SessionKey is NOT a LucideIcon
// const test: LucideIcon = SessionKey;

// This line should error if SessionKey is NOT a class or object with create
// const test2 = SessionKey.create;

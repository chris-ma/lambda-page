"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once here rather than at every call site.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

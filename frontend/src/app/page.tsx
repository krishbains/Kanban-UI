"use client"

import { Navbar } from "@/components/navbar";
import Board from "./Board";
import { SidebarWrapper } from "@/components/sidebar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <SidebarWrapper animate={false}>
        <div>
          <Board />
        </div>
      </SidebarWrapper>
    </div>
    )
}


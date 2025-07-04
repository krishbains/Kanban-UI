"use client"

import { Navbar } from "@/components/navbar";
import Board from "./Board";
import { SidebarWrapper } from "@/components/sidebar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <SidebarWrapper animate={true}>
        <div>
          <Board />
        </div>
      </SidebarWrapper>
    </div>
    )
}


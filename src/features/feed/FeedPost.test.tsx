// Feed post content + image source (Req 4.2, 4.3, 4.4, 10.4, 10.6).
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedPost } from "./FeedPost";
import { TESTIDS } from "../../contracts/testids";
import { LABELS } from "../../contracts/labels";
import type { HangoutWithPoster } from "../../data/types";

const post: HangoutWithPoster = {
  id: "h1",
  posterId: "u1",
  activityType: "Gym",
  photoUrl: "https://example.com/photo.jpg",
  points: 20,
  taggedUserIds: [],
  createdAt: new Date().toISOString(),
  posterDisplayName: "Ada Lovelace",
  cheerCount: 3,
  commentCount: 1,
};

describe("FeedPost", () => {
  it("renders poster, points, cheer label/count and the image source (10.4)", () => {
    render(<FeedPost post={post} hasCheered={false} onCheer={() => undefined} />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText(/\+20 points/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${LABELS.cheer} 3`))).toBeInTheDocument();

    const img = screen.getByTestId(TESTIDS.feedPostImage) as HTMLImageElement;
    expect(img).toHaveAttribute("src", post.photoUrl);
    expect(img.getAttribute("src")).not.toBe("");
  });

  it("fires onCheer when the cheer control is clicked (4.5)", () => {
    const onCheer = vi.fn();
    render(<FeedPost post={post} hasCheered={false} onCheer={onCheer} />);
    screen.getByText(new RegExp(`${LABELS.cheer} 3`)).click();
    expect(onCheer).toHaveBeenCalledWith("h1");
  });
});

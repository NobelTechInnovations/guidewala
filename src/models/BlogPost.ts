import { Schema, models, model } from "mongoose";

const BlogPostSchema = new Schema(
  {
    TITLE: { type: String, required: true },
    SLUG: { type: String, required: true, unique: true, index: true },
    EXCERPT: { type: String, default: "" },
    CONTENT_HTML: { type: String, required: true }, // rendered HTML that the site/app display
    CONTENT_MD: { type: String, default: "" }, // what the admin typed (Markdown/plain text); "" for legacy HTML posts
    COVER_IMAGE: { type: String, default: "" }, // absolute URL, /assets path, or /uploads/blogImg/<file>
    AUTHOR_NAME: { type: String, default: "Team Guidewala" },
    TAGS: { type: [String], default: [] },
    IS_PUBLISHED: { type: Boolean, default: true },
    PUBLISHED_ON: { type: Date, default: Date.now },
  },
  { collection: "blog_posts", timestamps: true }
);

export default models.BlogPost || model("BlogPost", BlogPostSchema);

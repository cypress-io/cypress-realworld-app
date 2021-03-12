import React from "react";
import { List } from "@material-ui/core";

import CommentListItem from "./CommentListItem";
import { Comment } from "../models";

export interface CommentsListProps {
  comments: Comment[];
}

const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  return (
    <List data-test="comments-list">
      {comments &&
        comments.map((comment: Comment) => <CommentListItem key={comment.id} comment={comment} />)}
    </List>
  );
};

export default CommentsList;

import React from "react";
import { ListItem, ListItemText } from "@mui/material";

import { Comment } from "../models";

export interface CommentListItemProps {
  comment: Comment;
}

const CommentListItem: React.FC<CommentListItemProps> = ({ comment }) => {
  return (
    <ListItem data-test={`comment-list-item-${comment.id}`}>
      <ListItemText primary={`${comment.content}`} />
    </ListItem>
  );
};

export default CommentListItem;

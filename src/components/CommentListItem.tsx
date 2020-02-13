import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { Comment } from "../models";
import { ListItemText } from "@material-ui/core";

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

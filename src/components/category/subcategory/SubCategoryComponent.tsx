import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../redux/hooks";
import SubCategory from "../../../types/SubCategory";
import {
  deleteSubCategory,
  getCategoryDataById,
  updateSubCategoryIsFavorite
} from "../../../middleware/category/CategoryMiddleware";
import {
  openUpdateSubCategoryModal,
  updateSubCategoryDescriptionById
} from "../../../middleware/modal/ModalMiddleware";
import insertAndHighlightText from "../../../taskpane/office-document";
import { sectionClassNames } from "./SubCategoryComponent.styles";
import { Icon } from "@fluentui/react";
import { ContextMenu } from "../../index";
import * as React from "react";
import { categoryContextMenu } from "../../../patterns/observer";

const ENABLE_FAST_EDIT = true; // Toggle this to enable/disable fast edit

const SubCategoryComponent: React.FC<SubCategory> = ({ id, categoryId, description, isFavorite, backgroundColor }) => {
  // For the icons
  const [isHovered, setIsHovered] = useState(false);

  // For the favorites' category details
  const [categoryDetails, setCategoryDetails] = useState({ code: "", colour: "" });

  // For fast edit
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);
  const textareaRef = useRef(null);

  // runs when the isEditing state changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // Handle when fast edit textarea loses focus
  const handleBlur = () => {
    if (isEditing) {
      setIsEditing(false);
      setTempDescription(description);
    }
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isFavorite) {
      dispatch(getCategoryDataById(categoryId)).then(data => {
        if (data) {
          setCategoryDetails({ code: data.code, colour: data.colour });
        }
      });
    }
  }, [dispatch, categoryId, isFavorite]);

  const toggleFavorite = useCallback(() => {
    dispatch(updateSubCategoryIsFavorite(id, !isFavorite));
  }, [dispatch, id, isFavorite]);


  const handleDelete = useCallback(() => {
    dispatch(deleteSubCategory(id));
  }, [dispatch, id]);

  const handleEdit = useCallback(() => {
    if (ENABLE_FAST_EDIT) {
      setIsEditing(!isEditing);
    } else {

      // modal opening logic here
      dispatch(openUpdateSubCategoryModal({ categoryId, description, id, isFavorite }));
    }
  }, [dispatch, categoryId, description, id, isFavorite, isEditing]);

  const handleTextInsertion = useCallback(async () => {
    await insertAndHighlightText(categoryId, description);
  }, [categoryId, description]);


  const menuItems = [
    {
      handler: () => dispatch(openUpdateSubCategoryModal({ categoryId, description, id, isFavorite })),
      label: categoryContextMenu.getEditLabel()
    },
    {
      handler: () => dispatch(deleteSubCategory(id)),
      label: categoryContextMenu.getDeleteLabel()
    }
  ];


  return (
    <tr onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className={sectionClassNames.section}>
      <td style={{ paddingRight: "6px" }}>
        <div style={{ width: "16px" }}>
          <div style={{
            backgroundColor: categoryDetails.colour || backgroundColor,
            height: isHovered ? "38px" : "32px",
            marginTop: "-1px",
            width: isHovered ? "16px" : "1px"
          }} className={sectionClassNames.activeRowColorBlock}>&nbsp;</div>
        </div>
      </td>
      <td onClick={toggleFavorite} title={isFavorite ? "Uit Favorieten verwijderen" : "Aan Favorieten toevoegen"}>
        <Icon iconName={isFavorite ? "FavoriteStarFill" : "FavoriteStar"}
              className={`${sectionClassNames.menuIcon} ${isFavorite && "isFavorite"} ${isHovered && "showIcon"}`} />
      </td>
      <td onClick={handleEdit}>
        <Icon iconName="Edit" className={`${sectionClassNames.menuIcon} ${isHovered && "showIcon"}`} title="Wijzigen" />
      </td>
      <td onClick={!isEditing ? handleTextInsertion : undefined}
          style={{ width: "100%" }} className={sectionClassNames.sectionText}>
        {!isEditing ? (
          description
        ) : (
          <textarea
            // This ref is for moving the caret to the last char when taking focus for quick edit
            ref={textareaRef}
            style={{ fontFamily: "Segoe UI", width: "90%" }}
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                // submit logic
                setIsEditing(false);
                dispatch(updateSubCategoryDescriptionById(id, tempDescription));
              } else if (e.key === "Escape") {
                e.preventDefault();

                // cancel logic
                setIsEditing(false);
                setTempDescription(description);
              }

              // shift enter for a new line is handled by default
            }}
            onBlur={handleBlur}
            autoFocus
          />
        )}
      </td>
      <td onClick={handleDelete}>
        <Icon iconName="Delete" className={`${sectionClassNames.menuIcon} ${isHovered && "showIcon"}`}
              title="Verwijderen" />
      </td>
      <td>
        <ContextMenu trigger={<Icon title={"Meer bekijken"} iconName="More"
                                    className={`${sectionClassNames.menuIcon} ${sectionClassNames.contextMenuIcon} ${isHovered && "showIcon"}`} />}
                     menuItems={menuItems} />
      </td>
    </tr>
  );
};

export default SubCategoryComponent;
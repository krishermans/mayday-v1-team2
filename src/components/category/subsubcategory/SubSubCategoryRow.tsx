import { sectionClassNames } from "../subcategory/SubCategoryComponent.styles";
import TableButton from "../../buttons/TableButton";
import EditSubSubCategoryComponent from "./EditSubSubCategoryComponent";
import { Icon } from "@fluentui/react";
import * as React from "react";
import SubSubCategory from "../../../types/SubSubCategory";
import { deleteSubSubCategory } from "../../../middleware/category/CategoryMiddleware";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getCategoryStyleName,
  getSubCategoryText,
  insertText,
  insertTextWithUrl
} from "../../../utils/TextInsertUtils";
import { selectAlwaysInsertFullText } from "../../../redux/settings/settings.slice";

interface SubSubCategoryRowProps {
  subSubCategory: SubSubCategory,
  isHovered: boolean,
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>,
  backgroundColor: string,
  shortCode: string,
  categoryId: string,
  description: string
}

const SubSubCategoryRow: React.FC<SubSubCategoryRowProps> = ({ subSubCategory, isHovered, setIsHovered, backgroundColor, shortCode, categoryId, description }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const alwaysInsertFullText = useAppSelector(selectAlwaysInsertFullText);

  const handleEdit = (subSubCategory: SubSubCategory) => {
    setIsEditing(!isEditing);
    setEditingId(subSubCategory.id);
  };

  const handleDelete = () => {
    dispatch(deleteSubSubCategory(subSubCategory.id));
  };

  const handleTextInsertion = async () => {
    const codeToInsert = shortCode + "." + subSubCategory.shortCode
    await getSubCategoryText(categoryId, description + " - " + subSubCategory.description, codeToInsert, alwaysInsertFullText)
      .then(result => getCategoryStyleName(categoryId, backgroundColor)
        .then(categoryStyleName => {
          subSubCategory.url && subSubCategory.url !== "" ? insertTextWithUrl(result, categoryStyleName, subSubCategory.url) : insertText(result, categoryStyleName)
        }));
  }

  return <tr
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    className={sectionClassNames.subSubCategoryRow} style={{ backgroundColor: backgroundColor + "1A" }}
    key={subSubCategory.id}
  >
    <TableButton
      tdClassName={sectionClassNames.subSubCategoryEditIcon}
      clickHandler={() => handleEdit(subSubCategory)}
      iconName={"Edit"} iconClassName={sectionClassNames.menuIcon}
      iconTitle={"Wijzigen"}
      showIconCondition={isHovered}
    />
    <td className={`${sectionClassNames.subSubCategoryShortCode}`}>{shortCode + "." + subSubCategory.shortCode}</td>
    <td className={`${sectionClassNames.subSubCategoryDescription}`}>

      {isEditing && editingId === subSubCategory.id ? (
        <EditSubSubCategoryComponent
          setEditingId={setEditingId}
          setIsEditing={setIsEditing}
          subSubCategory={subSubCategory}
        />
      ) : (
        <div
          onClick={handleTextInsertion}>

          <div className={sectionClassNames.sectionText}>
            <div className={sectionClassNames.descriptionTextContainerDiv}>
              <div className={sectionClassNames.descriptionTextDiv} title={subSubCategory.description}>
                {subSubCategory.url && (subSubCategory.url.trim() == "" ? "" :
                  <div className={sectionClassNames.urlIcon} title={`${subSubCategory.url}`}><Icon
                    iconName={"Link"}></Icon></div>)}
                {subSubCategory.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </td>

    <TableButton
      tdClassName={sectionClassNames.subSubCategoryDeleteIcon}
      clickHandler={handleDelete}
      iconName={"Delete"}
      iconClassName={sectionClassNames.menuIcon}
      showIconCondition={isHovered}
      iconTitle={"Verwijderen"}
    />
  </tr>
}

export default SubSubCategoryRow;

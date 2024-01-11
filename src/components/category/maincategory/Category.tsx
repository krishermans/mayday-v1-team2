import * as React from 'react';
import { useState, useRef } from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import Section from "../subcategory/Section";
import { CategoryProps } from "./Category.types";
import { categoryClassNames } from './Category.styles';

const Category: React.FC<CategoryProps> = ({ id, name, sections }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorSquareRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        id={`category-${id}`}
        className={categoryClassNames.categoryHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IconButton
          iconProps={{ iconName: isOpen ? 'ChevronDown' : 'ChevronRight' }}
          className={categoryClassNames.arrowIcon}
          onClick={() => setIsOpen(!isOpen)}
        />
        {name} ({sections})
        <div
          ref={colorSquareRef}
          className={categoryClassNames.colorSquare}
          style={{ backgroundColor: '#ff0' }}
        />
      </div>
      {isOpen && (
        <div className={categoryClassNames.categoryContent}>
          {[...Array(sections)].map((_, index) => (
            <Section key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;

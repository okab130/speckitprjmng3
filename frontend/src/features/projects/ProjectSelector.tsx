import React, { useEffect } from 'react';
import { Select } from 'antd';
import { useProjectStore } from '../../store/projectStore';

const { Option } = Select;

interface ProjectSelectorProps {
  value?: string | null;
  onChange?: (projectId: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  value,
  onChange,
  placeholder = 'すべてのプロジェクト',
  allowClear = true,
  style,
}) => {
  const { projects, fetchProjects, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects({ status: 'Active' }); // Only fetch active projects
  }, [fetchProjects]);

  const handleChange = (projectId: string | undefined) => {
    if (onChange) {
      onChange(projectId || null);
    }
  };

  return (
    <Select
      value={value || undefined}
      onChange={handleChange}
      placeholder={placeholder}
      loading={isLoading}
      allowClear={allowClear}
      style={{ minWidth: 200, ...style }}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.children as string).toLowerCase().includes(input.toLowerCase())
      }
    >
      {projects.map((project) => (
        <Option key={project.id} value={project.id}>
          {project.name}
        </Option>
      ))}
    </Select>
  );
};

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ProjectCard } from '../ProjectCard';
import type { Project } from '../../types';

const mockProject: Project = {
  id: 1,
  name: 'Website Redesign',
  description: 'Complete overhaul of company website',
  created_at: '2026-08-30T10:00:00Z',
};

describe('ProjectCard', () => {
  it('renders project name and description', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>
    );

    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Complete overhaul of company website')).toBeInTheDocument();
  });
});
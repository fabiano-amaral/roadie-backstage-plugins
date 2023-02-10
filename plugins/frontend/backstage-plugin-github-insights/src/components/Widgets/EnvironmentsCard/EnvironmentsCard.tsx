/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Link, List, ListItem } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  InfoCard,
  Progress,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { useRequest } from '../../../hooks/useRequest';
import { useEntityGithubScmIntegration } from '../../../hooks/useEntityGithubScmIntegration';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';
import { styles as useStyles } from '../../utils/styles';
import {
  GithubAuthPromptWrapper,
  PromptableLoginProps,
} from '../../AuthPromptWrapper';

type Environment = {
  id: number;
  html_url: string;
  name: string;
};

const EnvironmentsCardContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();

  const { value, loading, error } = useRequest(entity, 'environments', 0, 0);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!value) {
    return <Alert severity="info">No environments were found.</Alert>;
  }

  return (
    <List>
      {value.environments.map((environment: Environment) => (
        <ListItem className={classes.listItem} key={environment.id}>
          <Link
            href={environment.html_url}
            color="inherit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className={classes.releaseTitle}>{environment.name}</p>
          </Link>
        </ListItem>
      ))}
    </List>
  );
};

const EnvironmentsCard = (props: PromptableLoginProps) => {
  const { autoPromptLogin = true } = props;
  const classes = useStyles();
  const { entity } = useEntity();

  const { owner, repo } = useProjectEntity(entity);
  const { hostname } = useEntityGithubScmIntegration(entity);

  const projectAlert = isGithubInsightsAvailable(entity);
  if (!projectAlert) {
    return (
      <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
    );
  }

  return (
    <InfoCard
      title="Environments"
      deepLink={{
        link: `//${hostname}/${owner}/${repo}/deployments`,
        title: 'Environments',
        onClick: e => {
          e.preventDefault();
          window.open(`//${hostname}/${owner}/${repo}/deployments`);
        },
      }}
      className={classes.infoCard}
    >
      <GithubAuthPromptWrapper scope={['repo']} autoPrompt={autoPromptLogin}>
        <EnvironmentsCardContent />
      </GithubAuthPromptWrapper>
    </InfoCard>
  );
};

export default EnvironmentsCard;

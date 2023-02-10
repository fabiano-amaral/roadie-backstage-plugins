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
import { Chip, makeStyles, Tooltip } from '@material-ui/core';
// eslint-disable-next-line
import Alert from '@material-ui/lab/Alert';
import {
  InfoCard,
  Progress,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { useRequest } from '../../../hooks/useRequest';
import { colors } from './colors';
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from '../../utils/isGithubInsightsAvailable';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  GithubAuthPromptWrapper,
  PromptableLoginProps,
} from '../../AuthPromptWrapper';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
  barContainer: {
    height: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: '4px',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    position: 'relative',
  },
  languageDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: theme.spacing(1),
    display: 'inline-block',
  },
  label: {
    color: 'inherit',
  },
}));

type Language = {
  [key: string]: number;
};

const LanguagesCardContent = () => {
  const { entity } = useEntity();

  let barWidth = 0;
  const classes = useStyles();
  const { value, loading, error } = useRequest(entity, 'languages', 0, 0);
  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <Alert severity="error" className={classes.infoCard}>
        {error.message}
      </Alert>
    );
  }
  return (
    <>
      <div className={classes.barContainer}>
        {Object.entries(value as Language).map((language, index: number) => {
          barWidth =
            barWidth +
            (language[1] /
              Object.values(value as Record<string, number>).reduce(
                (a, b) => a + b,
              )) *
              100;
          return (
            <Tooltip
              title={language[0]}
              placement="bottom-end"
              key={language[0]}
            >
              <div
                className={classes.bar}
                key={language[0]}
                style={{
                  marginTop: index === 0 ? '0' : `-16px`,
                  zIndex: Object.keys(value).length - index,
                  backgroundColor: colors[language[0]]?.color || '#333',
                  width: `${barWidth}%`,
                }}
              />
            </Tooltip>
          );
        })}
      </div>
      {Object.entries(value as Language).map(language => (
        <Chip
          classes={{
            label: classes.label,
          }}
          label={
            <>
              <span
                className={classes.languageDot}
                style={{
                  backgroundColor: colors[language[0]]?.color || '#333',
                }}
              />
              {language[0]} -{' '}
              {(
                (language[1] /
                  Object.values(value as Record<string, number>).reduce(
                    (a, b) => a + b,
                  )) *
                100
              ).toFixed(2)}
              %
            </>
          }
          variant="outlined"
          key={language[0]}
        />
      ))}
    </>
  );
};

const LanguagesCard = (props: PromptableLoginProps) => {
  const { autoPromptLogin = true } = props;
  const { entity } = useEntity();
  const projectAlert = isGithubInsightsAvailable(entity);
  const classes = useStyles();

  if (!projectAlert) {
    return (
      <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
    );
  }

  return (
    <InfoCard title="Languages" className={classes.infoCard}>
      <GithubAuthPromptWrapper scope={['repo']} autoPrompt={autoPromptLogin}>
        <LanguagesCardContent />
      </GithubAuthPromptWrapper>
    </InfoCard>
  );
};

export default LanguagesCard;

/*
 * Copyright 2023 Larder Software Limited
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
import { OAuthApi, SessionApi } from '@backstage/core-plugin-api';
import {
  Button,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { PropsWithChildren, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

export type PromptableLoginProps<TProps = {}> = TProps & {
  autoPromptLogin?: boolean;
};

const NotAuthorized = (props: { auth: OAuthApi; scope: string[] }) => {
  const { auth, scope } = props;
  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography>
          You are not logged in. You need to be signed in to see the content of
          this card.
        </Typography>
      </Grid>
      <Grid item xs={4} container justifyContent="flex-end">
        <Tooltip placement="top" arrow title="Sign in to Github">
          <Button
            variant="outlined"
            color="primary"
            // Calling getAccessToken instead of a plain signIn because we are going to get the correct scopes right away. No need to second request
            onClick={() => auth.getAccessToken(scope)}
          >
            Sign in
          </Button>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export type AuthPromptWrapperProps = PropsWithChildren<{
  auth: OAuthApi & SessionApi;
  autoPrompt: boolean;
  scope: string[];
}>;

export const AuthPromptWrapper = (props: AuthPromptWrapperProps) => {
  const { auth, scope, autoPrompt, children } = props;
  const [sessionState, setSessionState] = useState<string | undefined>();
  const classes = useStyles();

  const { value, loading, error } = useAsync(async () => {
    auth.sessionState$().subscribe(state => {
      setSessionState(state);
    });

    return await auth.getAccessToken(scope, {
      instantPopup: autoPrompt,
      optional: true,
    });
  }, [sessionState]);

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

  if (value === '' && !autoPrompt) {
    return <NotAuthorized auth={auth} scope={scope} />;
  }
  return <>{children}</>;
};
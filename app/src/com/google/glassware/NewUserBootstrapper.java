/*
 * Copyright (C) 2013 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.google.glassware;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.services.mirror.model.Contact;
import com.google.api.services.mirror.model.NotificationConfig;
import com.google.api.services.mirror.model.Subscription;
import com.google.api.services.mirror.model.TimelineItem;
import com.google.common.collect.Lists;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

/**
 * Utility functions used when users first authenticate with this service
 * 
 * @author Jenny Murphy - http://google.com/+JennyMurphy
 */
public class NewUserBootstrapper {
  private static final Logger LOG = Logger.getLogger(NewUserBootstrapper.class.getSimpleName());

  /**
   * Bootstrap a new user. Do all of the typical actions for a new user:
   * <ul>
   * <li>Creating a timeline subscription</li>
   * <li>Sending the user a welcome message</li>
   * </ul>
   */
  public static void bootstrapNewUser(HttpServletRequest req, String userId) throws IOException {
    Credential credential = AuthUtil.newAuthorizationCodeFlow().loadCredential(userId);

    try {
      // Subscribe to timeline updates
      Subscription subscription =
          MirrorClient.insertSubscription(credential, WebUtil.buildUrl(req, "/notify"), userId,
              "timeline");
      LOG.info("Bootstrapper inserted subscription " + subscription.getId() + " for user " + userId);
    } catch (GoogleJsonResponseException e) {
      LOG.warning("Failed to create timeline subscription. Might be running on "
          + "localhost. Details:" + e.getDetails().toPrettyString());
    }

    // Send welcome timeline item
    TimelineItem timelineItem = new TimelineItem();
    timelineItem.setText( "Welcome to Chrome 2 Glass");
    timelineItem.setNotification(new NotificationConfig().setLevel("DEFAULT"));
    // Allow the user to remove the welcome message from their Timeline
    List<MenuItem> menuItemList = new ArrayList<MenuItem>();
    menuItemList.add(new MenuItem().setAction("DELETE"));
    timelineItem.setMenuItems(menuItemList);
    TimelineItem insertedItem = MirrorClient.insertTimelineItem(credential, timelineItem);
    LOG.info("Bootstrapper inserted welcome message " + insertedItem.getId() + " for user "
        + userId);
  }
}
